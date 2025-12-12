import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "@/hooks/useClientAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, Calendar, Car, MapPin, AlertTriangle, Edit, X, Plus, LogIn, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Reservation {
  id: string;
  codigo_reserva: string;
  status: string;
  data_retirada: string;
  data_devolucao_prevista: string;
  periodo_dias: number;
  valor_total: number;
  com_motorista: boolean;
  motorista_id: string | null;
  veiculo_id: string;
  loja_retirada_id: string;
  cliente_id: string;
  user_id: string | null;
  veiculos: {
    modelo: string;
    placa: string;
    categorias_veiculo: {
      nome: string;
      valor_diaria: number;
    };
  };
  lojas: {
    nome: string;
    cidades: {
      nome: string;
      uf: string;
    };
  };
  motoristas: {
    nome: string;
    valor_diaria: number;
  } | null;
}

export default function ClientReservations() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, profile, loading: authLoading } = useClientAuth();
  
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [editData, setEditData] = useState({
    periodo_dias: 7,
    com_motorista: false,
    motorista_id: "",
  });

  // Fetch reservations for logged-in user
  const { data: reservations, isLoading } = useQuery({
    queryKey: ["client-reservations", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("locacoes")
        .select(`
          *,
          veiculos(modelo, placa, categorias_veiculo(nome, valor_diaria)),
          lojas(nome, cidades(nome, uf)),
          motoristas(nome, valor_diaria)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Reservation[];
    },
    enabled: !!user?.id,
  });

  const { data: drivers } = useQuery({
    queryKey: ["drivers-for-edit"],
    queryFn: async () => {
      const { data } = await supabase
        .from("motoristas")
        .select("*")
        .eq("status", "Disponivel")
        .order("nome");
      return data;
    },
    enabled: showEditDialog,
  });

  const cancelReservation = useMutation({
    mutationFn: async (reservationId: string) => {
      const res = selectedReservation;
      if (!res) throw new Error("Reserva não encontrada");

      const { error: updateError } = await supabase
        .from("locacoes")
        .update({ status: "Cancelada" })
        .eq("id", reservationId);
      
      if (updateError) throw updateError;

      await supabase
        .from("veiculos")
        .update({ status: "Livre" })
        .eq("id", res.veiculo_id);

      if (res.com_motorista && res.motorista_id) {
        await supabase
          .from("motoristas")
          .update({ status: "Disponivel" })
          .eq("id", res.motorista_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-reservations"] });
      toast({
        title: "Reserva cancelada",
        description: "Sua reserva foi cancelada com sucesso.",
      });
      setShowCancelDialog(false);
    },
    onError: () => {
      toast({
        title: "Erro ao cancelar",
        description: "Não foi possível cancelar a reserva. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateReservation = useMutation({
    mutationFn: async () => {
      if (!selectedReservation) throw new Error("Reserva não encontrada");

      const valorDiaria =
        typeof selectedReservation.veiculos.categorias_veiculo.valor_diaria === "string"
          ? parseFloat(selectedReservation.veiculos.categorias_veiculo.valor_diaria)
          : selectedReservation.veiculos.categorias_veiculo.valor_diaria;

      let valorMotorista = 0;
      if (editData.com_motorista && editData.motorista_id) {
        const driver = drivers?.find((d) => d.id === editData.motorista_id);
        valorMotorista = driver
          ? typeof driver.valor_diaria === "string"
            ? parseFloat(driver.valor_diaria)
            : driver.valor_diaria || 0
          : 0;
      }

      const valorTotal = (valorDiaria + valorMotorista) * editData.periodo_dias;
      const dataDevolucaoPrevista = addDays(
        new Date(selectedReservation.data_retirada),
        editData.periodo_dias
      );

      if (selectedReservation.com_motorista && selectedReservation.motorista_id) {
        if (!editData.com_motorista || editData.motorista_id !== selectedReservation.motorista_id) {
          await supabase
            .from("motoristas")
            .update({ status: "Disponivel" })
            .eq("id", selectedReservation.motorista_id);
        }
      }

      if (editData.com_motorista && editData.motorista_id) {
        if (editData.motorista_id !== selectedReservation.motorista_id) {
          await supabase
            .from("motoristas")
            .update({ status: "Em Servico" })
            .eq("id", editData.motorista_id);
        }
      }

      const { error } = await supabase
        .from("locacoes")
        .update({
          periodo_dias: editData.periodo_dias,
          com_motorista: editData.com_motorista,
          motorista_id: editData.com_motorista ? editData.motorista_id : null,
          valor_total: valorTotal,
          data_devolucao_prevista: dataDevolucaoPrevista.toISOString().split("T")[0],
        })
        .eq("id", selectedReservation.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-reservations"] });
      toast({
        title: "Reserva atualizada",
        description: "Sua reserva foi modificada com sucesso.",
      });
      setShowEditDialog(false);
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a reserva. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const openEditDialog = (res: Reservation) => {
    setSelectedReservation(res);
    setEditData({
      periodo_dias: res.periodo_dias,
      com_motorista: res.com_motorista,
      motorista_id: res.motorista_id || "",
    });
    setShowEditDialog(true);
  };

  // Show login prompt if not authenticated
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/client/home")}
              className="mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          
          <Card>
            <CardContent className="py-12 text-center">
              <LogIn className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Faça login para ver suas reservas</h2>
              <p className="text-muted-foreground mb-6">
                Você precisa estar logado para visualizar suas reservas
              </p>
              <Button onClick={() => navigate("/client/auth?mode=login")}>
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const activeReservations = reservations?.filter(r => r.status === "Ativa") || [];
  const pastReservations = reservations?.filter(r => r.status !== "Ativa") || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/client/home")}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button onClick={() => navigate("/client/booking")}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Reserva
            </Button>
          </div>
          <h1 className="text-2xl font-bold mb-2">Minhas Reservas</h1>
          {profile && (
            <p className="text-muted-foreground">
              Olá, {profile.nome}
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Carregando reservas...</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && reservations?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Nenhuma reserva encontrada</h2>
              <p className="text-muted-foreground mb-6">
                Você ainda não fez nenhuma reserva
              </p>
              <Button onClick={() => navigate("/client/booking")}>
                Fazer uma Reserva
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Active Reservations */}
        {activeReservations.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Reservas Ativas</h2>
            <div className="space-y-4">
              {activeReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onView={() => {
                    setSelectedReservation(reservation);
                    setShowQRDialog(true);
                  }}
                  onEdit={() => openEditDialog(reservation)}
                  onCancel={() => {
                    setSelectedReservation(reservation);
                    setShowCancelDialog(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Past Reservations */}
        {pastReservations.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Histórico</h2>
            <div className="space-y-4">
              {pastReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  showActions={false}
                  onView={() => {
                    setSelectedReservation(reservation);
                    setShowQRDialog(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Cancel Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Cancelar Reserva
              </DialogTitle>
              <DialogDescription>
                Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                Voltar
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedReservation && cancelReservation.mutate(selectedReservation.id)}
                disabled={cancelReservation.isPending}
              >
                {cancelReservation.isPending ? "Cancelando..." : "Confirmar Cancelamento"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modificar Reserva</DialogTitle>
              <DialogDescription>
                Altere o período ou opções de motorista da sua reserva
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Período</Label>
                <Select
                  value={editData.periodo_dias.toString()}
                  onValueChange={(value) =>
                    setEditData({ ...editData, periodo_dias: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                <Checkbox
                  checked={editData.com_motorista}
                  onCheckedChange={(checked) =>
                    setEditData({ ...editData, com_motorista: checked as boolean, motorista_id: "" })
                  }
                />
                <div className="space-y-1 leading-none">
                  <Label>Incluir motorista profissional</Label>
                </div>
              </div>

              {editData.com_motorista && (
                <div className="space-y-2">
                  <Label>Motorista</Label>
                  <Select
                    value={editData.motorista_id}
                    onValueChange={(value) =>
                      setEditData({ ...editData, motorista_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um motorista" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers?.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.nome} - R${" "}
                          {(typeof driver.valor_diaria === "string"
                            ? parseFloat(driver.valor_diaria)
                            : driver.valor_diaria
                          )?.toFixed(2)}{" "}
                          /dia
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => updateReservation.mutate()}
                disabled={updateReservation.isPending || (editData.com_motorista && !editData.motorista_id)}
              >
                {updateReservation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* QR Code Dialog */}
        <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code da Reserva
              </DialogTitle>
              <DialogDescription>
                Apresente este código na retirada do veículo
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center py-6 space-y-4">
              <div className="bg-background p-4 rounded-lg border">
                <QRCodeSVG
                  value={selectedReservation?.codigo_reserva || ""}
                  size={200}
                  level="H"
                />
              </div>
              <p className="font-mono text-lg font-bold">
                {selectedReservation?.codigo_reserva}
              </p>
              <div className="text-center text-sm text-muted-foreground">
                <p>{selectedReservation?.veiculos.modelo}</p>
                <p>Placa: {selectedReservation?.veiculos.placa}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Reservation Card Component
function ReservationCard({
  reservation,
  onView,
  onEdit,
  onCancel,
  showActions = true,
}: {
  reservation: Reservation;
  onView?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
}) {
  const isActive = reservation.status === "Ativa";
  
  return (
    <Card 
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onView}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{reservation.veiculos.modelo}</CardTitle>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              reservation.status === "Ativa"
                ? "bg-accent/10 text-accent"
                : reservation.status === "Cancelada"
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {reservation.status}
          </span>
        </div>
        <CardDescription className="font-mono">
          {reservation.codigo_reserva}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>
            {reservation.lojas.nome} - {reservation.lojas.cidades.nome}/{reservation.lojas.cidades.uf}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {format(new Date(reservation.data_retirada), "dd/MM/yyyy")} - {format(new Date(reservation.data_devolucao_prevista), "dd/MM/yyyy")}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">{reservation.periodo_dias} dias</span>
          <span className="font-bold text-primary">
            R$ {Number(reservation.valor_total).toFixed(2)}
          </span>
        </div>

        {showActions && isActive && (
          <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
            <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-1" />
              Modificar
            </Button>
            <Button variant="destructive" size="sm" className="flex-1" onClick={onCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
