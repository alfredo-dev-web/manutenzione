import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { api } from "@/lib/api";
import type { InsertTask, Plant } from "@shared/schema";

interface TaskFormProps {
  onSubmit: (task: InsertTask) => void;
  isLoading?: boolean;
}

export default function TaskForm({ onSubmit, isLoading }: TaskFormProps) {
  const [formData, setFormData] = useState<InsertTask>({
    activity: "monitoraggio",
    description: "",
    location: "",
    plant: "",
    priority: "media",
    estimatedHours: 2,
  });
  
  const [plantSearchQuery, setPlantSearchQuery] = useState("");
  const [showPlantSearch, setShowPlantSearch] = useState(false);
  const plantSearchRef = useRef<HTMLDivElement>(null);

  // Fetch plants for the dropdown
  const { data: plants = [], isLoading: plantsLoading } = useQuery<Plant[]>({
    queryKey: ['/api/plants'],
    queryFn: api.getPlants,
  });

  // Search plants when user types
  const { data: searchResults = [] } = useQuery<Plant[]>({
    queryKey: ['/api/plants/search', plantSearchQuery],
    queryFn: () => api.searchPlants(plantSearchQuery),
    enabled: plantSearchQuery.length > 0 && showPlantSearch,
  });

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (plantSearchRef.current && !plantSearchRef.current.contains(event.target as Node)) {
        setShowPlantSearch(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      activity: "monitoraggio",
      description: "",
      location: "",
      plant: "",
      priority: "media",
      estimatedHours: 2,
    });
    setPlantSearchQuery("");
    setShowPlantSearch(false);
  };

  const handleChange = (field: keyof InsertTask, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePlantSelect = (plant: Plant) => {
    setFormData(prev => ({ 
      ...prev, 
      plant: plant.name,
      location: plant.location 
    }));
    setShowPlantSearch(false);
    setPlantSearchQuery("");
  };

  const filteredPlants = plantSearchQuery.length > 0 ? searchResults : plants;

  return (
    <Card className="shadow-sm border-slate-200">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Plus className="text-primary mr-2" />
          Nuova Task
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="activity" className="text-sm font-medium text-slate-700">
              Attività
            </Label>
            <Select value={formData.activity} onValueChange={(value) => handleChange("activity", value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Seleziona attività" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monitoraggio">Monitoraggio</SelectItem>
                <SelectItem value="impianto">Impianto</SelectItem>
                <SelectItem value="manutenzione ordinaria">Manutenzione Ordinaria</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="plant" className="text-sm font-medium text-slate-700">
              Impianto
            </Label>
            <div className="relative mt-2" ref={plantSearchRef}>
              <div className="flex space-x-2">
                <Input
                  id="plant"
                  type="text"
                  placeholder="Cerca impianto..."
                  value={plantSearchQuery}
                  onChange={(e) => {
                    setPlantSearchQuery(e.target.value);
                    setShowPlantSearch(true);
                  }}
                  onFocus={() => setShowPlantSearch(true)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPlantSearch(!showPlantSearch)}
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              
              {showPlantSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {plantsLoading ? (
                    <div className="p-3 text-sm text-slate-500">Caricamento impianti...</div>
                  ) : filteredPlants.length > 0 ? (
                    filteredPlants.map((plant) => (
                      <div
                        key={plant.id}
                        className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                        onClick={() => handlePlantSelect(plant)}
                      >
                        <div className="font-medium text-sm">{plant.name}</div>
                        <div className="text-xs text-slate-500">{plant.location}</div>
                        <div className="text-xs text-slate-400">{plant.capacity}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-slate-500">Nessun impianto trovato</div>
                  )}
                </div>
              )}
              
              {formData.plant && (
                <div className="mt-2 p-2 bg-slate-50 rounded border">
                  <div className="text-sm font-medium">{formData.plant}</div>
                  <div className="text-xs text-slate-500">{formData.location}</div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="location" className="text-sm font-medium text-slate-700">
              Ubicazione
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="Indirizzo impianto"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className="mt-2"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-slate-700">
              Descrizione
            </Label>
            <Textarea
              id="description"
              placeholder="Dettagli della manutenzione"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="mt-2 h-20"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority" className="text-sm font-medium text-slate-700">
                Priorità
              </Label>
              <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Seleziona priorità" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bassa">Bassa</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="estimatedHours" className="text-sm font-medium text-slate-700">
                Tempo Stimato
              </Label>
              <Select 
                value={formData.estimatedHours.toString()} 
                onValueChange={(value) => handleChange("estimatedHours", parseInt(value))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Ore stimate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 ora</SelectItem>
                  <SelectItem value="2">2 ore</SelectItem>
                  <SelectItem value="4">4 ore</SelectItem>
                  <SelectItem value="8">8 ore</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary text-white hover:bg-blue-700 font-medium"
            disabled={isLoading || !formData.plant}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isLoading ? "Creando..." : "Crea Task"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
