import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Clock } from "lucide-react";
import type { Team } from "@shared/schema";

interface TeamStatusCardProps {
  team: Team;
}

const statusColors = {
  available: "bg-secondary text-white",
  busy: "bg-warning text-white",
  offline: "bg-slate-400 text-white"
};

const statusLabels = {
  available: "Disponibile",
  busy: "Occupata",
  offline: "Offline"
};

export default function TeamStatusCard({ team }: TeamStatusCardProps) {
  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">{team.name}</h4>
          <Badge className={`text-xs ${statusColors[team.status as keyof typeof statusColors]}`}>
            {statusLabels[team.status as keyof typeof statusLabels]}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-slate-600">
            <User className="w-4 h-4 mr-2" />
            <span>{team.leader}</span>
          </div>
          
          <div className="flex items-center text-sm text-slate-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{team.currentLocation}</span>
          </div>
          
          <div className="flex items-center text-sm text-slate-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>{team.nextAvailable}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
