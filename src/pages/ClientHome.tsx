import { Button } from "@/components/ui/button";
import { Car, Calendar, Shield, CreditCard, Star, Search, LogIn, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useClientAuth } from "@/hooks/useClientAuth";
import carCivic from "@/assets/car-civic.png";

export default function ClientHome() {
  const { user, profile, signOut, loading } = useClientAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/client");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="pt-6 pb-4 px-6 flex items-center justify-between">
        <Link to="/client" className="text-sm text-muted-foreground hover:text-foreground">
          ← Voltar
        </Link>
        {!loading && (
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {profile?.nome?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Link to="/client/auth?mode=login">
                <Button variant="ghost" size="sm">
                  <LogIn className="h-4 w-4 mr-1" />
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <div className="text-center px-6">
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          Falls-to-Car
        </h1>
      </div>

      {/* Car Image */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <img
            src={carCivic}
            alt="Veículo"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-foreground rounded-t-[2rem] px-6 pt-8 pb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-background mb-3 leading-tight">
          {user ? `Olá, ${profile?.nome?.split(' ')[0] || 'Cliente'}!` : 'Alugue seu carro'}
        </h2>
        <p className="text-background/70 text-sm mb-6">
          Escolha o período e o veículo ideal para você
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3 mb-8">
          <Link to="/client/booking" className="w-full">
            <Button size="lg" className="w-full">
              <Calendar className="mr-2 h-5 w-5" />
              Fazer Agendamento
            </Button>
          </Link>
          
          {user ? (
            <Link to="/client/reservations" className="w-full">
              <Button 
                size="lg" 
                variant="secondary" 
                className="w-full bg-background/20 text-background hover:bg-background/30 border-0"
              >
                <Search className="mr-2 h-5 w-5" />
                Minhas Reservas
              </Button>
            </Link>
          ) : (
            <Link to="/client/auth?mode=login" className="w-full">
              <Button 
                size="lg" 
                variant="secondary" 
                className="w-full bg-background/20 text-background hover:bg-background/30 border-0"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Entrar para ver reservas
              </Button>
            </Link>
          )}
          
          <Link to="/client/rating" className="w-full">
            <Button 
              size="lg" 
              variant="ghost" 
              className="w-full text-background/70 hover:text-background hover:bg-background/10"
            >
              <Star className="mr-2 h-5 w-5" />
              Avaliar Veículo
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col items-center text-center">
            <Car className="h-6 w-6 text-primary mb-2" />
            <span className="text-xs text-background/70">Frota Moderna</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Calendar className="h-6 w-6 text-primary mb-2" />
            <span className="text-xs text-background/70">Reserva Fácil</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Shield className="h-6 w-6 text-primary mb-2" />
            <span className="text-xs text-background/70">Seguro Total</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <CreditCard className="h-6 w-6 text-primary mb-2" />
            <span className="text-xs text-background/70">Pagamento Seguro</span>
          </div>
        </div>
      </div>
    </div>
  );
}
