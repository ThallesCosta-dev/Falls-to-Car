import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "@/hooks/useClientAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PaymentForm, PaymentData } from "@/components/client/PaymentForm";
import { CategoryCard } from "@/components/client/CategoryCard";
import { VehicleCard } from "@/components/client/VehicleCard";
import { ChevronLeft, Car, User, Layers, Package, Plus, Minus } from "lucide-react";
import { addDays } from "date-fns";

interface SelectedService {
  servico_id: string;
  quantidade: number;
}

export default function ClientBooking() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, profile } = useClientAuth();
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    nome: "",
    cpf_cnpj: "",
    email: "",
    telefone: "",
    veiculo_id: "",
    loja_retirada_id: "",
    periodo_dias: 7,
    com_motorista: false,
    motorista_id: "",
  });
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);

  // Pre-fill form with user profile data
  useEffect(() => {
    if (profile && user) {
      setBookingData((prev) => ({
        ...prev,
        nome: profile.nome || prev.nome,
        cpf_cnpj: profile.cpf_cnpj || prev.cpf_cnpj,
        email: user.email || prev.email,
        telefone: profile.telefone || prev.telefone,
      }));
    }
  }, [profile, user]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { data: vehicles } = useQuery({
    queryKey: ["available-vehicles-client"],
    queryFn: async () => {
      const { data } = await supabase
        .from("veiculos")
        .select("*, categorias_veiculo(id, nome, valor_diaria), lojas(nome, cidades(nome, uf))")
        .eq("status", "Livre")
        .order("modelo");
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories-client"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categorias_veiculo")
        .select("*")
        .order("nome");
      return data;
    },
  });

  const { data: vehicleRatings } = useQuery({
    queryKey: ["vehicle-ratings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("avaliacoes_veiculos")
        .select("veiculo_id, nota");
      return data;
    },
  });

  const getVehicleRating = (vehicleId: string) => {
    const ratings = vehicleRatings?.filter((r) => r.veiculo_id === vehicleId) || [];
    if (ratings.length === 0) return null;
    const avg = ratings.reduce((sum, r) => sum + r.nota, 0) / ratings.length;
    return { avg: Math.round(avg * 10) / 10, count: ratings.length };
  };

  const filteredVehicles = useMemo(() => {
    if (!vehicles || !selectedCategoryId) return [];
    return vehicles.filter((vehicle) => vehicle.categorias_veiculo?.id === selectedCategoryId);
  }, [vehicles, selectedCategoryId]);

  const categoriesWithStats = useMemo(() => {
    if (!categories || !vehicles) return [];
    return categories.map((category) => {
      const categoryVehicles = vehicles.filter((v) => v.categorias_veiculo?.id === category.id);
      const prices = categoryVehicles.map((v) => {
        const price = typeof v.categorias_veiculo?.valor_diaria === "string"
          ? parseFloat(v.categorias_veiculo.valor_diaria)
          : v.categorias_veiculo?.valor_diaria || 0;
        return price;
      });
      return {
        ...category,
        vehicleCount: categoryVehicles.length,
        minPrice: prices.length > 0 ? Math.min(...prices) : category.valor_diaria,
        maxPrice: prices.length > 0 ? Math.max(...prices) : category.valor_diaria,
      };
    }).filter((c) => c.vehicleCount > 0);
  }, [categories, vehicles]);

  const { data: stores } = useQuery({
    queryKey: ["stores-client"],
    queryFn: async () => {
      const { data } = await supabase
        .from("lojas")
        .select("*, cidades(nome, uf)")
        .order("nome");
      return data;
    },
  });

  const { data: drivers } = useQuery({
    queryKey: ["drivers-client"],
    queryFn: async () => {
      const { data } = await supabase
        .from("motoristas")
        .select("*")
        .eq("status", "Disponivel")
        .order("nome");
      return data;
    },
  });

  const { data: servicosExtra } = useQuery({
    queryKey: ["servicos-extra-client"],
    queryFn: async () => {
      const { data } = await supabase
        .from("servicos_extra")
        .select("*")
        .eq("ativo", true)
        .order("nome");
      return data;
    },
  });

  const toggleService = (servicoId: string) => {
    setSelectedServices((prev) => {
      const existing = prev.find((s) => s.servico_id === servicoId);
      if (existing) {
        return prev.filter((s) => s.servico_id !== servicoId);
      }
      return [...prev, { servico_id: servicoId, quantidade: 1 }];
    });
  };

  const updateServiceQuantity = (servicoId: string, delta: number) => {
    setSelectedServices((prev) =>
      prev.map((s) =>
        s.servico_id === servicoId
          ? { ...s, quantidade: Math.max(1, s.quantidade + delta) }
          : s
      )
    );
  };

  const createBooking = useMutation({
    mutationFn: async ({ bookingData, paymentData, selectedServices }: { bookingData: any; paymentData: PaymentData; selectedServices: SelectedService[] }) => {
      // Criar ou buscar cliente
      let clienteId;
      const { data: existingClient } = await supabase
        .from("clientes")
        .select("id")
        .eq("cpf_cnpj", bookingData.cpf_cnpj)
        .maybeSingle();

      if (existingClient) {
        clienteId = existingClient.id;
      } else {
        const { data: newClient, error: clientError } = await supabase
          .from("clientes")
          .insert({
            nome: bookingData.nome,
            cpf_cnpj: bookingData.cpf_cnpj,
            email: bookingData.email,
            telefone: bookingData.telefone,
          })
          .select()
          .single();

        if (clientError) throw clientError;
        clienteId = newClient.id;
      }

      // Calcular valor total
      const vehicle = vehicles?.find((v) => v.id === bookingData.veiculo_id);
      const driver = bookingData.com_motorista
        ? drivers?.find((d) => d.id === bookingData.motorista_id)
        : null;

      const valorDiaria =
        typeof vehicle?.categorias_veiculo?.valor_diaria === "string"
          ? parseFloat(vehicle.categorias_veiculo.valor_diaria)
          : vehicle?.categorias_veiculo?.valor_diaria || 0;

      const valorMotorista = driver
        ? typeof driver.valor_diaria === "string"
          ? parseFloat(driver.valor_diaria)
          : driver.valor_diaria || 0
        : 0;

      // Calcular valor dos serviços extras
      let valorServicos = 0;
      selectedServices.forEach((ss) => {
        const servico = servicosExtra?.find((s) => s.id === ss.servico_id);
        if (servico) {
          const valorUnitario = typeof servico.valor_unitario === "string"
            ? parseFloat(servico.valor_unitario)
            : servico.valor_unitario || 0;
          if (servico.tipo_cobranca === "Por Dia") {
            valorServicos += valorUnitario * ss.quantidade * bookingData.periodo_dias;
          } else {
            valorServicos += valorUnitario * ss.quantidade;
          }
        }
      });

      const valorTotal = (valorDiaria + valorMotorista) * bookingData.periodo_dias + valorServicos;

      const dataRetirada = new Date();
      const dataDevolucaoPrevista = addDays(dataRetirada, bookingData.periodo_dias);
      const codigoReserva = `RES-${Date.now()}`;

      // Criar locação com user_id se estiver logado
      const { data: locacao, error: rentalError } = await supabase.from("locacoes").insert({
        cliente_id: clienteId,
        veiculo_id: bookingData.veiculo_id,
        loja_retirada_id: bookingData.loja_retirada_id,
        motorista_id: bookingData.com_motorista ? bookingData.motorista_id : null,
        periodo_dias: bookingData.periodo_dias,
        com_motorista: bookingData.com_motorista,
        valor_total: valorTotal,
        data_retirada: dataRetirada.toISOString().split("T")[0],
        data_devolucao_prevista: dataDevolucaoPrevista.toISOString().split("T")[0],
        codigo_reserva: codigoReserva,
        status: "Ativa",
        user_id: user?.id || null,
      }).select().single();

      if (rentalError) throw rentalError;

      // Salvar serviços extras
      if (selectedServices.length > 0 && locacao) {
        const servicosItens = selectedServices.map((ss) => {
          const servico = servicosExtra?.find((s) => s.id === ss.servico_id);
          const valorUnitario = servico
            ? typeof servico.valor_unitario === "string"
              ? parseFloat(servico.valor_unitario)
              : servico.valor_unitario || 0
            : 0;
          const valorTotalItem = servico?.tipo_cobranca === "Por Dia"
            ? valorUnitario * ss.quantidade * bookingData.periodo_dias
            : valorUnitario * ss.quantidade;

          return {
            locacao_id: locacao.id,
            servico_id: ss.servico_id,
            quantidade: ss.quantidade,
            valor_total_item: valorTotalItem,
          };
        });

        await supabase.from("locacoes_itens").insert(servicosItens);
      }

      // Atualizar status do veículo
      await supabase
        .from("veiculos")
        .update({ status: "Alugado" })
        .eq("id", bookingData.veiculo_id);

      // Atualizar status do motorista se necessário
      if (bookingData.com_motorista && bookingData.motorista_id) {
        await supabase
          .from("motoristas")
          .update({ status: "Em Servico" })
          .eq("id", bookingData.motorista_id);
      }

      const store = stores?.find((s) => s.id === bookingData.loja_retirada_id);

      return {
        codigoReserva,
        nomeCliente: bookingData.nome,
        veiculoModelo: vehicle?.modelo || "",
        veiculoPlaca: vehicle?.placa || "",
        lojaRetirada: store ? `${store.nome} - ${store.cidades?.nome}/${store.cidades?.uf}` : "",
        dataRetirada: dataRetirada.toISOString().split("T")[0],
        dataDevolucao: dataDevolucaoPrevista.toISOString().split("T")[0],
        periodoDias: bookingData.periodo_dias,
        valorTotal,
        comMotorista: bookingData.com_motorista,
        motoristaNome: driver?.nome,
        servicosExtras: selectedServices.map((ss) => {
          const servico = servicosExtra?.find((s) => s.id === ss.servico_id);
          return servico?.nome || "";
        }).filter(Boolean),
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["available-vehicles-client"] });
      navigate("/client/confirmation", { state: data });
    },
    onError: () => {
      toast({
        title: "Erro ao processar reserva",
        description: "Tente novamente ou entre em contato conosco.",
        variant: "destructive",
      });
    },
  });

  const selectedVehicle = vehicles?.find((v) => v.id === bookingData.veiculo_id);
  const selectedDriver = bookingData.com_motorista
    ? drivers?.find((d) => d.id === bookingData.motorista_id)
    : null;

  const valorDiaria = selectedVehicle
    ? typeof selectedVehicle.categorias_veiculo?.valor_diaria === "string"
      ? parseFloat(selectedVehicle.categorias_veiculo.valor_diaria)
      : selectedVehicle.categorias_veiculo?.valor_diaria || 0
    : 0;

  const valorMotorista = selectedDriver
    ? typeof selectedDriver.valor_diaria === "string"
      ? parseFloat(selectedDriver.valor_diaria)
      : selectedDriver.valor_diaria || 0
    : 0;

  // Calcular valor dos serviços extras
  const valorServicos = useMemo(() => {
    return selectedServices.reduce((total, ss) => {
      const servico = servicosExtra?.find((s) => s.id === ss.servico_id);
      if (servico) {
        const valorUnitario = typeof servico.valor_unitario === "string"
          ? parseFloat(servico.valor_unitario)
          : servico.valor_unitario || 0;
        if (servico.tipo_cobranca === "Por Dia") {
          return total + valorUnitario * ss.quantidade * bookingData.periodo_dias;
        }
        return total + valorUnitario * ss.quantidade;
      }
      return total;
    }, 0);
  }, [selectedServices, servicosExtra, bookingData.periodo_dias]);

  const valorTotal = (valorDiaria + valorMotorista) * bookingData.periodo_dias + valorServicos;

  const handlePaymentSubmit = (paymentData: PaymentData) => {
    createBooking.mutate({ bookingData, paymentData, selectedServices });
  };

  const canProceedStep1 =
    bookingData.nome &&
    bookingData.cpf_cnpj &&
    bookingData.email &&
    bookingData.telefone;

  const canProceedStep2 =
    bookingData.veiculo_id &&
    bookingData.loja_retirada_id &&
    (!bookingData.com_motorista || bookingData.motorista_id);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => step === 1 ? navigate("/client/home") : setStep(step - 1)}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold mb-2">Agendar Locação</h1>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Dados Pessoais */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Seus Dados
              </CardTitle>
              <CardDescription>Preencha suas informações pessoais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={bookingData.nome}
                  onChange={(e) => setBookingData({ ...bookingData, nome: e.target.value })}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF/CNPJ</Label>
                <Input
                  id="cpf"
                  value={bookingData.cpf_cnpj}
                  onChange={(e) => setBookingData({ ...bookingData, cpf_cnpj: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={bookingData.email}
                  onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={bookingData.telefone}
                  onChange={(e) => setBookingData({ ...bookingData, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
              >
                Continuar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Escolha da Categoria e Veículo */}
        {step === 2 && (
          <div className="space-y-4">
            {!selectedCategoryId ? (
              // Category Selection
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Escolha a Categoria
                </h2>
                <div className="space-y-3">
                  {categoriesWithStats.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      vehicleCount={category.vehicleCount}
                      minPrice={category.minPrice}
                      maxPrice={category.maxPrice}
                      onSelect={() => setSelectedCategoryId(category.id)}
                    />
                  ))}
                </div>
                {categoriesWithStats.length === 0 && (
                  <Card>
                    <CardContent className="py-8">
                      <p className="text-center text-muted-foreground">
                        Nenhuma categoria disponível no momento
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              // Vehicle Selection
              <div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setBookingData({ ...bookingData, veiculo_id: "" });
                  }}
                  className="mb-3"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Voltar para categorias
                </Button>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Escolha o Veículo
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {filteredVehicles.length} veículo(s) disponível(is)
                </p>

                <div className="space-y-4">
                  {filteredVehicles.map((vehicle) => {
                    const ratingData = getVehicleRating(vehicle.id);
                    return (
                  <VehicleCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        rating={ratingData}
                        isSelected={bookingData.veiculo_id === vehicle.id}
                        onSelect={() => setBookingData({ 
                          ...bookingData, 
                          veiculo_id: vehicle.id,
                          loja_retirada_id: vehicle.loja_atual_id 
                        })}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rest of step 2 - store, period, driver */}
            {selectedVehicle && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Loja de Retirada</Label>
                    <div className="p-3 rounded-md border bg-muted/50">
                      <p className="font-medium">
                        {selectedVehicle.lojas?.nome} - {selectedVehicle.lojas?.cidades?.nome}/{selectedVehicle.lojas?.cidades?.uf}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Local onde o veículo está disponível
                      </p>
                    </div>
                  </div>

                <div className="space-y-2">
                  <Label>Período</Label>
                  <Select
                    value={bookingData.periodo_dias.toString()}
                    onValueChange={(value) =>
                      setBookingData({ ...bookingData, periodo_dias: parseInt(value) })
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
                    checked={bookingData.com_motorista}
                    onCheckedChange={(checked) =>
                      setBookingData({ ...bookingData, com_motorista: checked as boolean })
                    }
                  />
                  <div className="space-y-1 leading-none">
                    <Label>Incluir motorista profissional</Label>
                    <p className="text-sm text-muted-foreground">
                      Adicione um motorista ao seu aluguel
                    </p>
                  </div>
                </div>

                {bookingData.com_motorista && (
                  <div className="space-y-2">
                    <Label>Motorista</Label>
                    <Select
                      value={bookingData.motorista_id}
                      onValueChange={(value) =>
                        setBookingData({ ...bookingData, motorista_id: value })
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

                {/* Serviços Extras */}
                {servicosExtra && servicosExtra.length > 0 && (
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Serviços Extras (opcional)
                    </Label>
                    <div className="space-y-2">
                      {servicosExtra.map((servico) => {
                        const isSelected = selectedServices.some(
                          (s) => s.servico_id === servico.id
                        );
                        const selectedService = selectedServices.find(
                          (s) => s.servico_id === servico.id
                        );
                        const valorUnitario =
                          typeof servico.valor_unitario === "string"
                            ? parseFloat(servico.valor_unitario)
                            : servico.valor_unitario || 0;

                        return (
                          <div
                            key={servico.id}
                            className={`p-3 rounded-lg border transition-colors ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleService(servico.id)}
                                />
                                <div>
                                  <p className="font-medium text-sm">
                                    {servico.nome}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    R$ {valorUnitario.toFixed(2)}{" "}
                                    {servico.tipo_cobranca === "Por Dia"
                                      ? "/dia"
                                      : "(taxa única)"}
                                  </p>
                                </div>
                              </div>
                              {isSelected &&
                                servico.tipo_cobranca !== "Por Dia" && (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() =>
                                        updateServiceQuantity(servico.id, -1)
                                      }
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-6 text-center text-sm">
                                      {selectedService?.quantidade || 1}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() =>
                                        updateServiceQuantity(servico.id, 1)
                                      }
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedVehicle && (
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Resumo do Valor</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Veículo ({bookingData.periodo_dias} dias)</span>
                        <span>R$ {(valorDiaria * bookingData.periodo_dias).toFixed(2)}</span>
                      </div>
                      {bookingData.com_motorista && selectedDriver && (
                        <div className="flex justify-between">
                          <span>Motorista ({bookingData.periodo_dias} dias)</span>
                          <span>R$ {(valorMotorista * bookingData.periodo_dias).toFixed(2)}</span>
                        </div>
                      )}
                      {selectedServices.map((ss) => {
                        const servico = servicosExtra?.find((s) => s.id === ss.servico_id);
                        if (!servico) return null;
                        const valorUnitario = typeof servico.valor_unitario === "string"
                          ? parseFloat(servico.valor_unitario)
                          : servico.valor_unitario || 0;
                        const valorItem = servico.tipo_cobranca === "Por Dia"
                          ? valorUnitario * ss.quantidade * bookingData.periodo_dias
                          : valorUnitario * ss.quantidade;
                        return (
                          <div key={ss.servico_id} className="flex justify-between">
                            <span>
                              {servico.nome}
                              {ss.quantidade > 1 ? ` (x${ss.quantidade})` : ""}
                              {servico.tipo_cobranca === "Por Dia" ? ` (${bookingData.periodo_dias} dias)` : ""}
                            </span>
                            <span>R$ {valorItem.toFixed(2)}</span>
                          </div>
                        );
                      })}
                      <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
                        <span>Total</span>
                        <span className="text-primary">R$ {valorTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                >
                  Ir para Pagamento
                </Button>
              </CardContent>
            </Card>
            )}
          </div>
        )}

        {/* Step 3: Pagamento */}
        {step === 3 && (
          <PaymentForm
            totalValue={valorTotal}
            onSubmit={handlePaymentSubmit}
            isLoading={createBooking.isPending}
          />
        )}
      </div>
    </div>
  );
}
