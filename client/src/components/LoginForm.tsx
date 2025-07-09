import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn } from "lucide-react";
import { api } from "@/lib/api";

interface LoginFormProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: (data: typeof credentials) => api.login(data),
    onSuccess: (user) => {
      console.log('Login successful, user data:', user);
      setError("");
      onLoginSuccess(user);
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      setError(error.message || "Credenziali non valide");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate(credentials);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Sistema Gestione Task
          </CardTitle>
          <p className="text-sm text-gray-600 text-center">
            Accedi al sistema
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p className="font-medium text-blue-900 mb-1">Account di test:</p>
            <p className="text-blue-800">
              <strong>Gestore:</strong> gestore / admin123<br/>
              <strong>Operatore:</strong> mario.bianchi / squadra123
            </p>
            <button 
              type="button" 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Pulisci cache se hai problemi
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Inserisci username"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Inserisci password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loginMutation.isPending}
            >
              <LogIn className="w-4 h-4 mr-2" />
              {loginMutation.isPending ? "Accedendo..." : "Accedi"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}