import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/client/StarRating";
import { ChevronLeft, Car, CheckCircle2 } from "lucide-react";

export default function ClientRating() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codigoReserva = searchParams.get("codigo") || "";

  const [step, setStep] = useState<"search" | "rate" | "success">("search");
  const [codigo, setCodigo] = useState(codigoReserva);
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState("");

  const { data: rental, refetch: searchRental, isLoading: searching } = useQuery({
    queryKey: ["rental-for-rating", codigo],
    queryFn: async () => {
      if (!codigo) return null;
      
      const { data, error } = await supabase
        .from("locacoes")
        .select(`
          *,
          veiculos(id, modelo, placa, imagem_url, categorias_veiculo(nome)),
          clientes(id, nome),
          avaliacoes_veiculos(id)
        `)
        .eq("codigo_reserva", codigo)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: false,
  });

  const submitRating = useMutation({
    mutationFn: async () => {
      if (!rental) throw new Error("Locação não encontrada");

      const { error } = await supabase.from("avaliacoes_veiculos").insert({
        veiculo_id: rental.veiculo_id,
        cliente_id: rental.cliente_id,
        locacao_id: rental.id,
        nota: rating,
        comentario: comentario || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setStep("success");
      toast({
        title: "Avaliação enviada!",
        description: "Obrigado pelo seu feedback.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao enviar avaliação",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = async () => {
    const result = await searchRental();
    if (result.data) {
      const hasReview = result.data.avaliacoes_veiculos && 
        (Array.isArray(result.data.avaliacoes_veiculos) 
          ? result.data.avaliacoes_veiculos.length > 0 
          : result.data.avaliacoes_veiculos !== null);
      
      if (hasReview) {
        toast({
          title: "Avaliação já realizada",
          description: "Você já avaliou esta locação.",
          variant: "destructive",
        });
      } else {
        setStep("rate");
      }
    } else {
      toast({
        title: "Locação não encontrada",
        description: "Verifique o código e tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => step === "search" ? navigate("/client/home") : setStep("search")}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <h1 className="text-2xl font-bold mb-6">Avaliar Veículo</h1>

        {step === "search" && (
          <Card>
            <CardHeader>
              <CardTitle>Buscar Locação</CardTitle>
              <CardDescription>
                Digite o código da sua reserva para avaliar o veículo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código da Reserva</Label>
                <Input
                  id="codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="RES-1234567890"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSearch}
                disabled={!codigo || searching}
              >
                {searching ? "Buscando..." : "Buscar"}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "rate" && rental && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Avalie sua Experiência
              </CardTitle>
              <CardDescription>
                Como foi alugar o {rental.veiculos?.modelo}?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                {rental.veiculos?.imagem_url ? (
                  <img
                    src={rental.veiculos.imagem_url}
                    alt={rental.veiculos.modelo}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-muted-foreground/20 rounded-lg flex items-center justify-center">
                    <Car className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{rental.veiculos?.modelo}</p>
                  <p className="text-sm text-muted-foreground">
                    {rental.veiculos?.categorias_veiculo?.nome}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Placa: {rental.veiculos?.placa}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Sua avaliação</Label>
                <div className="flex justify-center py-2">
                  <StarRating rating={rating} onRatingChange={setRating} size="lg" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  {rating === 0 && "Selecione uma nota"}
                  {rating === 1 && "Muito ruim"}
                  {rating === 2 && "Ruim"}
                  {rating === 3 && "Regular"}
                  {rating === 4 && "Bom"}
                  {rating === 5 && "Excelente"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comentario">Comentário (opcional)</Label>
                <Textarea
                  id="comentario"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Conte-nos mais sobre sua experiência..."
                  rows={4}
                />
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => submitRating.mutate()}
                disabled={rating === 0 || submitRating.isPending}
              >
                {submitRating.isPending ? "Enviando..." : "Enviar Avaliação"}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "success" && (
          <Card>
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-xl font-bold">Obrigado!</h2>
              <p className="text-muted-foreground">
                Sua avaliação foi enviada com sucesso. Seu feedback nos ajuda a melhorar nossos serviços.
              </p>
              <Button onClick={() => navigate("/client/home")} className="mt-4">
                Voltar ao Início
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
