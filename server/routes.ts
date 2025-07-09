import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertTaskSchema, insertPlantSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    
    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  // Broadcast updates to all connected clients
  const broadcast = (message: any) => {
    const data = JSON.stringify(message);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };

  // Authentication endpoints
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username e password sono richiesti' });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Credenziali non valide' });
      }
      
      // Don't send password in response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Errore del server' });
    }
  });

  // Task routes
  app.get('/api/tasks', async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

  app.get('/api/tasks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch task' });
    }
  });

  app.post('/api/tasks', async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      
      // Broadcast task creation to all clients
      broadcast({ type: 'TASK_CREATED', task });
      
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid task data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create task' });
    }
  });

  app.patch('/api/tasks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.updateTask(id, req.body);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      // Broadcast task update to all clients
      broadcast({ type: 'TASK_UPDATED', task });
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update task' });
    }
  });

  app.delete('/api/tasks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);
      if (!success) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      // Broadcast task deletion to all clients
      broadcast({ type: 'TASK_DELETED', taskId: id });
      
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete task' });
    }
  });

  // Team routes
  app.get('/api/teams', async (req, res) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch teams' });
    }
  });

  app.get('/api/teams/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const team = await storage.getTeam(id);
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch team' });
    }
  });

  app.patch('/api/teams/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const team = await storage.updateTeam(id, req.body);
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      // Broadcast team update to all clients
      broadcast({ type: 'TEAM_UPDATED', team });
      
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update team' });
    }
  });

  // Task assignment endpoint
  app.post('/api/tasks/:id/assign', async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const { teamId } = req.body;
      
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      // Update task status and assignment
      const updatedTask = await storage.updateTask(taskId, {
        status: 'in_progress',
        assignedTeamId: teamId,
        startedAt: new Date()
      });
      
      // Update team status
      const updatedTeam = await storage.updateTeam(teamId, {
        status: 'busy',
        currentLocation: task.plant,
        nextAvailable: `In corso fino a ${new Date(Date.now() + task.estimatedHours * 60 * 60 * 1000).toLocaleTimeString()}`
      });
      
      // Broadcast updates
      broadcast({ type: 'TASK_ASSIGNED', task: updatedTask, team: updatedTeam });
      
      res.json({ task: updatedTask, team: updatedTeam });
    } catch (error) {
      res.status(500).json({ message: 'Failed to assign task' });
    }
  });

  // Task completion endpoint
  app.post('/api/tasks/:id/complete', async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      // Update task status
      const updatedTask = await storage.updateTask(taskId, {
        status: 'completed',
        completedAt: new Date()
      });
      
      // Update team status if task was assigned
      if (task.assignedTeamId) {
        const updatedTeam = await storage.updateTeam(task.assignedTeamId, {
          status: 'available',
          currentLocation: 'Base Operativa',
          nextAvailable: 'Libera ora'
        });
        
        broadcast({ type: 'TASK_COMPLETED', task: updatedTask, team: updatedTeam });
      } else {
        broadcast({ type: 'TASK_COMPLETED', task: updatedTask });
      }
      
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: 'Failed to complete task' });
    }
  });

  // Statistics endpoint
  app.get('/api/stats', async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      const teams = await storage.getTeams();
      
      const stats = {
        totalTasks: tasks.length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        available: tasks.filter(t => t.status === 'available').length,
        activeTeams: teams.filter(t => t.status === 'available').length,
        busyTeams: teams.filter(t => t.status === 'busy').length,
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch statistics' });
    }
  });

  // Plant routes
  app.get('/api/plants', async (req, res) => {
    try {
      const plants = await storage.getPlants();
      res.json(plants);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch plants' });
    }
  });

  app.get('/api/plants/search', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: 'Query parameter "q" is required' });
      }
      
      const plants = await storage.searchPlants(q);
      res.json(plants);
    } catch (error) {
      res.status(500).json({ message: 'Failed to search plants' });
    }
  });

  app.post('/api/plants', async (req, res) => {
    try {
      const validatedData = insertPlantSchema.parse(req.body);
      const plant = await storage.createPlant(validatedData);
      res.status(201).json(plant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid plant data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create plant' });
    }
  });

  return httpServer;
}
