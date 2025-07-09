import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Monitor, Tablet, Bell, User, ListTodo, Filter, RefreshCw, Play, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import TaskCard from "@/components/TaskCard";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Task, Team } from "@shared/schema";

export default function TabletPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isConnected } = useWebSocket();
  const { logout, user } = useAuth();
  const [selectedTeamId, setSelectedTeamId] = useState<string>(user?.teamId?.toString() || "1");

  // Fetch data
  const { data: tasks = [], isLoading: tasksLoading, refetch: refetchTasks } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    queryFn: api.getTasks,
  });

  const { data: teams = [], isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ['/api/teams'],
    queryFn: api.getTeams,
  });

  // Mutations
  const assignTaskMutation = useMutation({
    mutationFn: ({ taskId, teamId }: { taskId: number; teamId: number }) => 
      api.assignTask(taskId, teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Task assegnata",
        description: "La task è stata assegnata alla squadra.",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'assegnazione della task.",
        variant: "destructive",
      });
    }
  });

  const completeTaskMutation = useMutation({
    mutationFn: api.completeTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Task completata",
        description: "La task è stata completata con successo.",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il completamento della task.",
        variant: "destructive",
      });
    }
  });

  const handleAssignTask = (taskId: number) => {
    assignTaskMutation.mutate({ taskId, teamId: parseInt(selectedTeamId) });
  };

  const handleCompleteTask = (taskId: number) => {
    completeTaskMutation.mutate(taskId);
  };

  const handleRefreshTasks = () => {
    refetchTasks();
  };

  const selectedTeam = teams.find(team => team.id === parseInt(selectedTeamId));
  const availableTasks = tasks.filter(task => task.status === 'available');
  const currentTask = tasks.find(task => 
    task.status === 'in_progress' && task.assignedTeamId === parseInt(selectedTeamId)
  );

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
                Operatore
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
                  <span className="text-sm font-medium">{user?.username || 'Operatore'}</span>
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
        
        {/* Team Selection Header */}
        <Card className="shadow-sm border-slate-200 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <Tablet className="text-primary mr-2" />
                Interfaccia Squadra
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">Squadra:</span>
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Seleziona squadra" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Team Status Card */}
            {selectedTeam && (
              <div className="bg-secondary bg-opacity-10 rounded-lg p-4 border border-secondary border-opacity-30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-secondary rounded-full"></div>
                    <span className="font-medium">
                      {selectedTeam.name} - {selectedTeam.status === 'available' ? 'Disponibile' : 'Occupata'}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    <span>Ultimo aggiornamento: {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Task Status */}
        {currentTask && (
          <Card className="bg-warning bg-opacity-10 border border-warning border-opacity-30 mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-warning flex items-center">
                <Play className="mr-2" />
                Task in Corso
              </h3>
              
              <TaskCard 
                task={currentTask} 
                onComplete={handleCompleteTask}
                showCompleteButton={true}
                isTablet={true}
              />
            </CardContent>
          </Card>
        )}
        
        {/* Available ListTodo for Team */}
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center">
                <ListTodo className="text-primary mr-2" />
                Task Disponibili
              </h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="text-slate-600">
                  <Filter className="w-4 h-4 mr-1" />
                  Filtri
                </Button>
                <Button 
                  onClick={handleRefreshTasks}
                  className="bg-primary text-white hover:bg-blue-700"
                  disabled={tasksLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${tasksLoading ? 'animate-spin' : ''}`} />
                  Aggiorna
                </Button>
              </div>
            </div>
            
            {/* Task Grid - Optimized for Tablet */}
            {tasksLoading ? (
              <div className="text-center py-8">Caricamento task...</div>
            ) : availableTasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 text-lg">Nessuna task disponibile al momento</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onAssign={handleAssignTask}
                    showAssignButton={true}
                    isTablet={true}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
