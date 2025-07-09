import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Tablet, Bell, User, ListTodo, Clock, CheckCircle, Users, Filter, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import TaskCard from "@/components/TaskCard";
import TeamStatusCard from "@/components/TeamStatusCard";
import TaskForm from "@/components/TaskForm";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Task, Team, InsertTask } from "@shared/schema";

interface Stats {
  totalTasks: number;
  inProgress: number;
  completed: number;
  available: number;
  activeTeams: number;
  busyTeams: number;
}

export default function DesktopPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isConnected } = useWebSocket();
  const { logout, user } = useAuth();

  // Fetch data
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    queryFn: api.getTasks,
  });

  const { data: teams = [], isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ['/api/teams'],
    queryFn: api.getTeams,
  });

  const { data: stats } = useQuery<Stats>({
    queryKey: ['/api/stats'],
    queryFn: api.getStats,
  });

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: api.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Task creata con successo",
        description: "La nuova task è stata aggiunta al sistema.",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione della task.",
        variant: "destructive",
      });
    }
  });

  const handleCreateTask = (task: InsertTask) => {
    createTaskMutation.mutate(task);
  };

  const availableTasks = tasks.filter(task => task.status === 'available');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <div className="min-h-screen bg-[hsl(248,39%,98%)]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-primary text-2xl mr-3">☀️</div>
              <h1 className="text-xl font-bold text-[hsl(30,23%,11%)]">SolarMaint</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Role Badge */}
              <Badge variant="secondary" className="hidden md:flex">
                <User className="w-3 h-3 mr-1" />
                Gestore
              </Badge>
              
              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Bell className="w-5 h-5 text-slate-400 hover:text-primary cursor-pointer" />
                  <Badge className="absolute -top-1 -right-1 bg-warning text-white text-xs rounded-full h-5 w-5 flex items-center justify-center p-0">
                    3
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{user?.username || 'Gestore'}</span>
                  {isConnected && (
                    <div className="w-2 h-2 bg-secondary rounded-full" title="Connesso" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-red-600"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Task Totali</p>
                  <p className="text-2xl font-bold text-[hsl(30,23%,11%)]">
                    {stats?.totalTasks || 0}
                  </p>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded-full">
                  <ListTodo className="text-primary text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">In Corso</p>
                  <p className="text-2xl font-bold text-[hsl(30,23%,11%)]">
                    {stats?.inProgress || 0}
                  </p>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded-full">
                  <Clock className="text-warning text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Completate</p>
                  <p className="text-2xl font-bold text-[hsl(30,23%,11%)]">
                    {stats?.completed || 0}
                  </p>
                </div>
                <div className="bg-secondary bg-opacity-10 p-3 rounded-full">
                  <CheckCircle className="text-secondary text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Squadre Attive</p>
                  <p className="text-2xl font-bold text-[hsl(30,23%,11%)]">
                    {stats?.activeTeams || 0}
                  </p>
                </div>
                <div className="bg-secondary bg-opacity-10 p-3 rounded-full">
                  <Users className="text-secondary text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Task Creation Form */}
          <div className="lg:col-span-1">
            <TaskForm 
              onSubmit={handleCreateTask} 
              isLoading={createTaskMutation.isPending}
            />
          </div>
          
          {/* Task Management Board */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <ListTodo className="text-primary mr-2" />
                    Gestione Task
                  </h3>
                  <Button variant="outline" size="sm" className="text-slate-600">
                    <Filter className="w-4 h-4 mr-1" />
                    Filtri
                  </Button>
                </div>
                
                {tasksLoading ? (
                  <div className="text-center py-8">Caricamento task...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Available ListTodo */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-700">Disponibili</h4>
                        <Badge variant="outline" className="text-slate-600">
                          {availableTasks.length}
                        </Badge>
                      </div>
                      {availableTasks.length === 0 ? (
                        <p className="text-slate-500 text-sm">Nessuna task disponibile</p>
                      ) : (
                        availableTasks.map(task => (
                          <TaskCard key={task.id} task={task} />
                        ))
                      )}
                    </div>
                    
                    {/* In Progress ListTodo */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-700">In Corso</h4>
                        <Badge className="bg-warning bg-opacity-20 text-warning">
                          {inProgressTasks.length}
                        </Badge>
                      </div>
                      {inProgressTasks.length === 0 ? (
                        <p className="text-slate-500 text-sm">Nessuna task in corso</p>
                      ) : (
                        inProgressTasks.map(task => (
                          <TaskCard key={task.id} task={task} />
                        ))
                      )}
                    </div>
                    
                    {/* Completed ListTodo */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-700">Completate</h4>
                        <Badge className="bg-secondary bg-opacity-20 text-secondary">
                          {completedTasks.length}
                        </Badge>
                      </div>
                      {completedTasks.length === 0 ? (
                        <p className="text-slate-500 text-sm">Nessuna task completata</p>
                      ) : (
                        completedTasks.map(task => (
                          <TaskCard key={task.id} task={task} />
                        ))
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Team Status */}
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="text-primary mr-2" />
              Status Squadre
            </h3>
            
            {teamsLoading ? (
              <div className="text-center py-8">Caricamento squadre...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {teams.map(team => (
                  <TeamStatusCard key={team.id} team={team} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
