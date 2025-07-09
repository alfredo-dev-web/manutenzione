import { apiRequest } from './queryClient';
import type { Task, Team, Plant, InsertTask } from '@shared/schema';

export const api = {
  // Auth
  login: (credentials: { username: string; password: string }) => apiRequest('POST', '/api/auth/login', credentials),
  
  // Tasks
  getTasks: () => fetch('/api/tasks').then(res => res.json()),
  getTask: (id: number) => fetch(`/api/tasks/${id}`).then(res => res.json()),
  createTask: (task: InsertTask) => apiRequest('POST', '/api/tasks', task),
  updateTask: (id: number, updates: Partial<Task>) => apiRequest('PATCH', `/api/tasks/${id}`, updates),
  deleteTask: (id: number) => apiRequest('DELETE', `/api/tasks/${id}`),
  assignTask: (taskId: number, teamId: number) => apiRequest('POST', `/api/tasks/${taskId}/assign`, { teamId }),
  completeTask: (taskId: number) => apiRequest('POST', `/api/tasks/${taskId}/complete`),

  // Teams
  getTeams: () => fetch('/api/teams').then(res => res.json()),
  getTeam: (id: number) => fetch(`/api/teams/${id}`).then(res => res.json()),
  updateTeam: (id: number, updates: Partial<Team>) => apiRequest('PATCH', `/api/teams/${id}`, updates),

  // Plants
  getPlants: () => fetch('/api/plants').then(res => res.json()),
  searchPlants: (query: string) => fetch(`/api/plants/search?q=${encodeURIComponent(query)}`).then(res => res.json()),

  // Stats
  getStats: () => fetch('/api/stats').then(res => res.json()),
};
