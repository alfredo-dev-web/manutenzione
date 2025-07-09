import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "@/components/LoginForm";
import DesktopPage from "@/pages/desktop";
import TabletPage from "@/pages/tablet";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user, login } = useAuth();
  
  console.log('Router state:', { isAuthenticated, isLoading, user });
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Caricamento...</div>;
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={login} />;
  }

  // Route based on user role
  if (user?.role === 'gestore') {
    console.log('Rendering routes for gestore');
    return (
      <Switch>
        <Route path="/" component={DesktopPage} />
        <Route path="/desktop" component={DesktopPage} />
        <Route component={NotFound} />
      </Switch>
    );
  } else if (user?.role === 'operatore') {
    console.log('Rendering routes for operatore');
    return (
      <Switch>
        <Route path="/" component={TabletPage} />
        <Route path="/tablet" component={TabletPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  console.log('No matching role, showing NotFound');
  return <NotFound />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-[hsl(248,39%,98%)]">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
