import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ClientAuthProvider } from "@/hooks/useClientAuth";
import Dashboard from "./pages/Dashboard";
import Veiculos from "./pages/Veiculos";
import Locacoes from "./pages/Locacoes";
import Clientes from "./pages/Clientes";
import Motoristas from "./pages/Motoristas";
import Vistorias from "./pages/Vistorias";
import Multas from "./pages/Multas";
import Lojas from "./pages/Lojas";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ClientHome from "./pages/ClientHome";
import ClientOnboarding from "./pages/ClientOnboarding";
import ClientAuth from "./pages/ClientAuth";
import ClientBooking from "./pages/ClientBooking";
import ClientRating from "./pages/ClientRating";
import ClientConfirmation from "./pages/ClientConfirmation";
import ClientReservations from "./pages/ClientReservations";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ClientAuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/client" element={<ClientOnboarding />} />
              <Route path="/client/auth" element={<ClientAuth />} />
              <Route path="/client/home" element={<ClientHome />} />
              <Route path="/client/booking" element={<ClientBooking />} />
              <Route path="/client/rating" element={<ClientRating />} />
              <Route path="/client/confirmation" element={<ClientConfirmation />} />
              <Route path="/client/reservations" element={<ClientReservations />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/veiculos" element={<ProtectedRoute><Veiculos /></ProtectedRoute>} />
              <Route path="/locacoes" element={<ProtectedRoute><Locacoes /></ProtectedRoute>} />
              <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
              <Route path="/motoristas" element={<ProtectedRoute><Motoristas /></ProtectedRoute>} />
              <Route path="/vistorias" element={<ProtectedRoute><Vistorias /></ProtectedRoute>} />
              <Route path="/multas" element={<ProtectedRoute><Multas /></ProtectedRoute>} />
              <Route path="/lojas" element={<ProtectedRoute><Lojas /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ClientAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
