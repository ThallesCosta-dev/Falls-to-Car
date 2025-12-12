import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, Car, MapPin, User, Home } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ConfirmationData {
  codigoReserva: string;
  nomeCliente: string;
  veiculoModelo: string;
  veiculoPlaca: string;
  lojaRetirada: string;
  dataRetirada: string;
  dataDevolucao: string;
  periodoDias: number;
  valorTotal: number;
  comMotorista: boolean;
  motoristaNome?: string;
}

export default function ClientConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const confirmationData = location.state as ConfirmationData | null;

  if (!confirmationData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Dados da reserva não encontrados</p>
            <Button onClick={() => navigate("/client")}>Voltar ao Início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const qrData = JSON.stringify({
    codigo: confirmationData.codigoReserva,
    cliente: confirmationData.nomeCliente,
    veiculo: confirmationData.veiculoPlaca,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
            <CheckCircle className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Reserva Confirmada!</h1>
          <p className="text-muted-foreground">
            Sua reserva foi realizada com sucesso
          </p>
        </div>

        {/* Reservation Code Card */}
        <Card className="mb-6 border-2 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-lg text-muted-foreground">
              Código da Reserva
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-primary tracking-wider">
              {confirmationData.codigoReserva}
            </p>
          </CardContent>
        </Card>

        {/* QR Code Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center text-lg">
              QR Code para Retirada
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="bg-card p-4 rounded-lg border">
              <QRCodeSVG
                value={qrData}
                size={180}
                level="H"
                includeMargin={true}
                fgColor="hsl(217, 91%, 60%)"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-3 text-center">
              Apresente este QR Code na loja para retirar seu veículo
            </p>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Detalhes da Reserva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{confirmationData.nomeCliente}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Car className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Veículo</p>
                <p className="font-medium">{confirmationData.veiculoModelo}</p>
                <p className="text-sm text-muted-foreground">{confirmationData.veiculoPlaca}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Loja de Retirada</p>
                <p className="font-medium">{confirmationData.lojaRetirada}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Período</p>
                <p className="font-medium">
                  {format(new Date(confirmationData.dataRetirada), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
                <p className="text-sm text-muted-foreground">
                  até {format(new Date(confirmationData.dataDevolucao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
                <p className="text-sm text-primary font-medium mt-1">
                  {confirmationData.periodoDias} dias
                </p>
              </div>
            </div>

            {confirmationData.comMotorista && confirmationData.motoristaNome && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Motorista</p>
                  <p className="font-medium">{confirmationData.motoristaNome}</p>
                </div>
              </div>
            )}

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Valor Total</span>
                <span className="text-2xl font-bold text-primary">
                  R$ {confirmationData.valorTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            className="w-full"
            size="lg"
            onClick={() => navigate("/client/reservations", { 
              state: { 
                codigo_reserva: confirmationData.codigoReserva 
              } 
            })}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Ver Minhas Reservas
          </Button>
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => navigate("/client/booking")}
          >
            <Car className="h-4 w-4 mr-2" />
            Nova Reserva
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            size="lg"
            onClick={() => navigate("/client")}
          >
            <Home className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  );
}
