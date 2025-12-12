import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  MapPin,
  LogOut,
  ClipboardList,
  UserCheck,
  ClipboardCheck,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const navigation = [
  { name: "Tela Principal", href: "/", icon: LayoutDashboard },
  { name: "Veículos", href: "/veiculos", icon: Car },
  { name: "Locações", href: "/locacoes", icon: ClipboardList },
  { name: "Vistorias", href: "/vistorias", icon: ClipboardCheck },
  { name: "Multas", href: "/multas", icon: AlertTriangle },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Motoristas", href: "/motoristas", icon: UserCheck },
  { name: "Lojas", href: "/lojas", icon: MapPin },
];

export function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-56 flex-col bg-background">
      {/* Logo */}
      <div className="px-6 py-6">
        <h1 className="text-xl font-bold text-foreground">Falls-to-car</h1>
        <p className="text-xs text-muted-foreground">ERP</p>
      </div>

      {/* Menu Label */}
      <div className="px-6 py-2">
        <p className="text-xs text-muted-foreground font-medium">Menu Principal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent/10 hover:text-accent"
              activeClassName="bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  );
}