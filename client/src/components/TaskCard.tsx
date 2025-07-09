import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User, Calendar } from "lucide-react";
import type { Task } from "@shared/schema";

interface TaskCardProps {
  task: Task;
  onAssign?: (taskId: number) => void;
  onComplete?: (taskId: number) => void;
  showAssignButton?: boolean;
  showCompleteButton?: boolean;
  isTablet?: boolean;
}

const priorityColors = {
  bassa: "bg-slate-400 text-white",
  media: "bg-slate-400 text-white", 
  alta: "bg-warning text-white",
  urgente: "bg-warning text-white"
};

const statusColors = {
  available: "bg-slate-100 text-slate-600",
  in_progress: "bg-warning text-white",
  completed: "bg-secondary text-white"
};

export default function TaskCard({ 
  task, 
  onAssign, 
  onComplete, 
  showAssignButton = false, 
  showCompleteButton = false,
  isTablet = false 
}: TaskCardProps) {
  const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('it-IT', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className={`hover:shadow-lg transition-all ${isTablet ? 'p-6' : 'p-4'}`}>
      <CardContent className="p-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className={`font-semibold ${isTablet ? 'text-lg' : 'text-sm'} mb-2`}>
              {task.activity}
            </h4>
            {task.description && (
              <p className={`text-slate-600 ${isTablet ? 'mb-3' : 'mb-2'} ${isTablet ? 'text-base' : 'text-xs'}`}>
                {task.description}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1 ml-3">
            <Badge className={`text-xs ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
            {task.status !== 'available' && (
              <Badge className={`text-xs ${statusColors[task.status as keyof typeof statusColors]}`}>
                {task.status === 'in_progress' ? 'In Corso' : 'Completata'}
              </Badge>
            )}
          </div>
        </div>

        <div className={`space-y-${isTablet ? '3' : '2'} mb-4`}>
          <div className="flex items-center text-slate-600">
            <MapPin className={`mr-3 text-primary ${isTablet ? 'w-5 h-5' : 'w-4 h-4'}`} />
            <span className={isTablet ? 'text-base' : 'text-xs'}>{task.location}</span>
          </div>
          
          <div className="flex items-center text-slate-600">
            <User className={`mr-3 text-primary ${isTablet ? 'w-5 h-5' : 'w-4 h-4'}`} />
            <span className={isTablet ? 'text-base' : 'text-xs'}>Impianto: {task.plant}</span>
          </div>
          
          <div className="flex items-center text-slate-600">
            <Clock className={`mr-3 text-primary ${isTablet ? 'w-5 h-5' : 'w-4 h-4'}`} />
            <span className={isTablet ? 'text-base' : 'text-xs'}>
              {task.status === 'in_progress' && task.startedAt
                ? `Iniziata: ${formatDate(task.startedAt)}`
                : `Tempo stimato: ${task.estimatedHours} ore`}
            </span>
          </div>
          
          <div className="flex items-center text-slate-600">
            <Calendar className={`mr-3 text-primary ${isTablet ? 'w-5 h-5' : 'w-4 h-4'}`} />
            <span className={isTablet ? 'text-base' : 'text-xs'}>
              {task.status === 'completed' && task.completedAt
                ? `Completata: ${formatDate(task.completedAt)}`
                : `Creata: ${formatDate(task.createdAt)}`}
            </span>
          </div>
        </div>

        {(showAssignButton || showCompleteButton) && (
          <div className="flex space-x-3">
            {showAssignButton && (
              <Button 
                onClick={() => onAssign?.(task.id)}
                className={`flex-1 bg-primary text-white hover:bg-blue-700 ${isTablet ? 'py-3 px-4 text-lg' : 'py-2 px-3'}`}
              >
                ✓ Accetta Task
              </Button>
            )}
            
            {showCompleteButton && (
              <Button 
                onClick={() => onComplete?.(task.id)}
                className={`flex-1 bg-secondary text-white hover:bg-green-700 ${isTablet ? 'py-3 px-4 text-lg' : 'py-2 px-3'}`}
              >
                ✓ Completa Task
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
