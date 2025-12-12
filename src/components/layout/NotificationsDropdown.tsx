import { useState, useEffect } from "react";
import { Bell, Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Notification {
  id: string;
  codigo_reserva: string;
  created_at: string;
  valor_total: number;
  veiculos: {
    modelo: string;
  } | null;
  clientes: {
    nome: string;
  } | null;
}

export function NotificationsDropdown() {
  const [readNotifications, setReadNotifications] = useState<string[]>([]);

  // Load read notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("readNotifications");
    if (saved) {
      setReadNotifications(JSON.parse(saved));
    }
  }, []);

  // Fetch recent bookings as notifications
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await supabase
        .from("locacoes")
        .select(`
          id,
          codigo_reserva,
          created_at,
          valor_total,
          veiculos(modelo),
          clientes(nome)
        `)
        .order("created_at", { ascending: false })
        .limit(10);
      return data as Notification[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = notifications?.filter(n => !readNotifications.includes(n.id)).length || 0;

  const markAsRead = (id: string) => {
    const newRead = [...readNotifications, id];
    setReadNotifications(newRead);
    localStorage.setItem("readNotifications", JSON.stringify(newRead));
  };

  const markAllAsRead = () => {
    const allIds = notifications?.map(n => n.id) || [];
    setReadNotifications(allIds);
    localStorage.setItem("readNotifications", JSON.stringify(allIds));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-[10px] font-medium text-accent-foreground flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="font-semibold text-sm">Notificações</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={markAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {notifications?.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Nenhuma notificação
            </div>
          )}
          {notifications?.map((notification) => {
            const isUnread = !readNotifications.includes(notification.id);
            return (
              <DropdownMenuItem
                key={notification.id}
                className="px-3 py-3 cursor-pointer"
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUnread ? 'bg-accent/20' : 'bg-muted'}`}>
                    <Calendar className={`h-4 w-4 ${isUnread ? 'text-accent' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm truncate ${isUnread ? 'font-medium' : ''}`}>
                        Nova reserva: {notification.veiculos?.modelo || "Veículo"}
                      </p>
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-accent flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {notification.clientes?.nome || "Cliente"} - R$ {Number(notification.valor_total).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
