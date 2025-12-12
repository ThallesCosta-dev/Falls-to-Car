import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Plus, XCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { Pencil } from "lucide-react";

interface SelectedService {
  servico_id: string;
  quantidade: number;
}

export default function Locacoes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [rentalToCancel, setRentalToCancel] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const form = useForm({
    defaultValues: {
      cliente_id: "",
      veiculo_id: "",
      loja_retirada_id: "",
      periodo_dias: 7,
      com_motorista: false,
      motorista_id: "",
    },
  });

  const comMotorista = form.watch("com_motorista");
  const periodoDias = form.watch("periodo_dias");
  const veiculoId = form.watch("veiculo_id");

  const { data: rentals, isLoading } = useQuery({
    queryKey: ["rentals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("locacoes")
        .select(`
          *,
          clientes(nome, cpf_cnpj),
          veiculos(modelo, placa),
          lojas(nome),
          motoristas(nome)
        `)
        .order("created_at", { ascending: false });
      return data;
    },
  });

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await supabase
        .from("clientes")
        .select("*")
        .order("nome");
      return data;
    },
  });

  const { data: availableVehicles } = useQuery({
    queryKey: ["available-vehicles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("veiculos")
        .select("*, categorias_veiculo(nome, valor_diaria)")
        .eq("status", "Livre")
        .order("modelo");
      return data;
    },
  });

  const { data: stores } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const { data } = await supabase
        .from("lojas")
        .select("*, cidades(nome, uf)")
        .order("nome");
      return data;
    },
  });

  const { data: drivers } = useQuery({
    queryKey: ["drivers-available"],
    queryFn: async () => {
      const { data } = await supabase
        .from("motoristas")
        .select("*")
        .eq("status", "Disponivel")
        .order("nome");
      return data;
    },
  });

  const { data: extraServices } = useQuery({
    queryKey: ["extra-services"],
    queryFn: async () => {
      const { data } = await supabase
        .from("servicos_extra")
        .select("*")
        .eq("ativo", true)
        .order("nome");
      return data;
    },
  });

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.servico_id === serviceId);
      if (exists) {
        return prev.filter(s => s.servico_id !== serviceId);
      }
      return [...prev, { servico_id: serviceId, quantidade: 1 }];
    });
  };

  const updateServiceQuantity = (serviceId: string, quantidade: number) => {
    setSelectedServices(prev => 
      prev.map(s => s.servico_id === serviceId ? { ...s, quantidade } : s)
    );
  };

  const calculateServicesTotal = () => {
    if (!extraServices) return 0;
    return selectedServices.reduce((total, selected) => {
      const service = extraServices.find(s => s.id === selected.servico_id);
      if (!service) return total;
      const valor = typeof service.valor_unitario === 'string' 
        ? parseFloat(service.valor_unitario) 
        : service.valor_unitario || 0;
      if (service.tipo_cobranca === 'Por Dia') {
        return total + (valor * periodoDias * selected.quantidade);
      }
      return total + (valor * selected.quantidade);
    }, 0);
  };

  const calculateTotal = () => {
    const vehicle = availableVehicles?.find((v) => v.id === veiculoId);
    const driver = comMotorista && form.getValues("motorista_id")
      ? drivers?.find((d) => d.id === form.getValues("motorista_id"))
      : null;

    const valorDiaria = typeof vehicle?.categorias_veiculo?.valor_diaria === "string"
      ? parseFloat(vehicle.categorias_veiculo.valor_diaria)
      : vehicle?.categorias_veiculo?.valor_diaria || 0;

    const valorMotorista = driver
      ? typeof driver.valor_diaria === "string"
        ? parseFloat(driver.valor_diaria)
        : driver.valor_diaria || 0
      : 0;

    const baseTotal = (valorDiaria + valorMotorista) * periodoDias;
    const servicesTotal = calculateServicesTotal();

    return baseTotal + servicesTotal;
  };

  const createRental = useMutation({
    mutationFn: async (values: any) => {
      const vehicle = availableVehicles?.find((v) => v.id === values.veiculo_id);
      const driver = values.com_motorista
        ? drivers?.find((d) => d.id === values.motorista_id)
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

      const baseTotal = (valorDiaria + valorMotorista) * values.periodo_dias;
      const servicesTotal = calculateServicesTotal();
      const valorTotal = baseTotal + servicesTotal;

      const dataRetirada = new Date();
      const dataDevolucaoPrevista = addDays(dataRetirada, values.periodo_dias);

      const { data: newRental, error } = await supabase.from("locacoes").insert({
        cliente_id: values.cliente_id,
        veiculo_id: values.veiculo_id,
        loja_retirada_id: values.loja_retirada_id,
        motorista_id: values.com_motorista ? values.motorista_id : null,
        periodo_dias: values.periodo_dias,
        com_motorista: values.com_motorista,
        valor_total: valorTotal,
        data_retirada: dataRetirada.toISOString().split("T")[0],
        data_devolucao_prevista: dataDevolucaoPrevista
          .toISOString()
          .split("T")[0],
        codigo_reserva: `RES-${Date.now()}`,
        status: "Ativa",
      }).select().single();

      if (error) throw error;

      // Save extra services
      if (selectedServices.length > 0 && newRental) {
        const servicesToInsert = selectedServices.map(s => {
          const service = extraServices?.find(es => es.id === s.servico_id);
          const valor = typeof service?.valor_unitario === 'string' 
            ? parseFloat(service.valor_unitario) 
            : service?.valor_unitario || 0;
          const valorTotalItem = service?.tipo_cobranca === 'Por Dia'
            ? valor * values.periodo_dias * s.quantidade
            : valor * s.quantidade;

          return {
            locacao_id: newRental.id,
            servico_id: s.servico_id,
            quantidade: s.quantidade,
            valor_total_item: valorTotalItem,
          };
        });

        await supabase.from("locacoes_itens").insert(servicesToInsert);
      }

      await supabase
        .from("veiculos")
        .update({ status: "Alugado" })
        .eq("id", values.veiculo_id);

      if (values.com_motorista && values.motorista_id) {
        await supabase
          .from("motoristas")
          .update({ status: "Em Servico" })
          .eq("id", values.motorista_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast({
        title: "Locação criada",
        description: "A locação foi criada com sucesso.",
      });
      form.reset();
      setSelectedServices([]);
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a locação.",
        variant: "destructive",
      });
    },
  });

  const updateRental = useMutation({
    mutationFn: async (values: any) => {
      const vehicle = availableVehicles?.find((v) => v.id === values.veiculo_id);
      const driver = values.com_motorista
        ? drivers?.find((d) => d.id === values.motorista_id)
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

      const valorTotal =
        (valorDiaria + valorMotorista) * values.periodo_dias;

      const { error } = await supabase
        .from("locacoes")
        .update({
          cliente_id: values.cliente_id,
          veiculo_id: values.veiculo_id,
          loja_retirada_id: values.loja_retirada_id,
          motorista_id: values.com_motorista ? values.motorista_id : null,
          periodo_dias: values.periodo_dias,
          com_motorista: values.com_motorista,
          valor_total: valorTotal,
        })
        .eq("id", editingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      toast({
        title: "Locação atualizada",
        description: "A locação foi atualizada com sucesso.",
      });
      form.reset();
      setOpen(false);
      setEditingId(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a locação.",
        variant: "destructive",
      });
    },
  });

  const cancelRental = useMutation({
    mutationFn: async (rental: any) => {
      const { error } = await supabase
        .from("locacoes")
        .update({ status: "Cancelada" })
        .eq("id", rental.id);
      if (error) throw error;

      // Liberar veículo
      await supabase
        .from("veiculos")
        .update({ status: "Livre" })
        .eq("id", rental.veiculo_id);

      // Liberar motorista se houver
      if (rental.motorista_id) {
        await supabase
          .from("motoristas")
          .update({ status: "Disponivel" })
          .eq("id", rental.motorista_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast({
        title: "Locação cancelada",
        description: "A locação foi cancelada com sucesso.",
      });
      setCancelDialogOpen(false);
      setRentalToCancel(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível cancelar a locação.",
        variant: "destructive",
      });
    },
  });

  const handleCancelClick = (rental: any) => {
    setRentalToCancel(rental);
    setCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    if (rentalToCancel) {
      cancelRental.mutate(rentalToCancel);
    }
  };

  const handleEdit = (rental: any) => {
    setEditingId(rental.id);
    form.reset({
      cliente_id: rental.cliente_id,
      veiculo_id: rental.veiculo_id,
      loja_retirada_id: rental.loja_retirada_id,
      periodo_dias: rental.periodo_dias,
      com_motorista: rental.com_motorista || false,
      motorista_id: rental.motorista_id || "",
    });
    setOpen(true);
  };

  const handleSubmit = (values: any) => {
    if (editingId) {
      updateRental.mutate(values);
    } else {
      createRental.mutate(values);
    }
  };

  useEffect(() => {
    if (!open) {
      setEditingId(null);
      setSelectedServices([]);
      form.reset({
        cliente_id: "",
        veiculo_id: "",
        loja_retirada_id: "",
        periodo_dias: 7,
        com_motorista: false,
        motorista_id: "",
      });
    }
  }, [open]);

  return (
    <Layout 
      title="Gestão de Locações" 
      subtitle="Controle de todas as locações"
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Locação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Locação" : "Nova Locação"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="cliente_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o cliente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients?.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.nome} - {client.cpf_cnpj}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="veiculo_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Veículo</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableVehicles?.map((vehicle) => (
                                <SelectItem key={vehicle.id} value={vehicle.id}>
                                  {vehicle.modelo} - {vehicle.placa}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="loja_retirada_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loja de Retirada</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {stores?.map((store) => (
                                <SelectItem key={store.id} value={store.id}>
                                  {store.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="periodo_dias"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Período</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="7">7 dias</SelectItem>
                            <SelectItem value="15">15 dias</SelectItem>
                            <SelectItem value="30">30 dias</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="com_motorista"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Locação com motorista</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {comMotorista && (
                    <FormField
                      control={form.control}
                      name="motorista_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Motorista</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o motorista" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {drivers?.map((driver) => (
                                <SelectItem key={driver.id} value={driver.id}>
                                  {driver.nome} - R${" "}
                                  {(typeof driver.valor_diaria === 'string'
                                    ? parseFloat(driver.valor_diaria)
                                    : driver.valor_diaria
                                  )?.toFixed(2)}{" "}
                                  /dia
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Extra Services */}
                  <div className="space-y-3">
                    <FormLabel>Serviços Extras</FormLabel>
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                      {extraServices?.map((service) => {
                        const isSelected = selectedServices.some(s => s.servico_id === service.id);
                        const selectedService = selectedServices.find(s => s.servico_id === service.id);
                        const valor = typeof service.valor_unitario === 'string' 
                          ? parseFloat(service.valor_unitario) 
                          : service.valor_unitario || 0;
                        
                        return (
                          <div key={service.id} className="flex items-center justify-between gap-2 p-2 rounded hover:bg-muted/50">
                            <div className="flex items-center gap-2 flex-1">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleService(service.id)}
                              />
                              <div className="flex-1">
                                <span className="text-sm font-medium">{service.nome}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  R$ {valor.toFixed(2)} {service.tipo_cobranca === 'Por Dia' ? '/dia' : '(taxa única)'}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">Qtd:</span>
                                <Select
                                  value={selectedService?.quantidade.toString() || "1"}
                                  onValueChange={(v) => updateServiceQuantity(service.id, parseInt(v))}
                                >
                                  <SelectTrigger className="w-16 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5].map(n => (
                                      <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {(!extraServices || extraServices.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          Nenhum serviço extra disponível
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Total Preview */}
                  {veiculoId && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Estimado:</span>
                        <span className="text-xl font-bold text-primary">
                          R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      {selectedServices.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Inclui {selectedServices.length} serviço(s) extra(s)
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createRental.isPending || updateRental.isPending}>
                      {createRental.isPending || updateRental.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Motorista</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : rentals?.length ? (
                rentals.map((rental) => (
                  <TableRow key={rental.id}>
                    <TableCell className="font-mono text-sm">
                      {rental.codigo_reserva}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{rental.clientes?.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {rental.clientes?.cpf_cnpj}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {rental.veiculos?.modelo}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {rental.veiculos?.placa}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{format(new Date(rental.data_retirada), "dd/MM/yyyy")}</p>
                        <p className="text-muted-foreground">
                          {rental.periodo_dias} dias
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      R$ {(() => {
                        const valor = typeof rental.valor_total === 'string' 
                          ? parseFloat(rental.valor_total) 
                          : (rental.valor_total || 0);
                        return valor.toFixed(2);
                      })()}
                    </TableCell>
                    <TableCell>
                      {rental.com_motorista ? (
                        <span className="text-sm">{rental.motoristas?.nome}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          rental.status === "Ativa"
                            ? "default"
                            : rental.status === "Concluida"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {rental.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(rental)}
                          disabled={rental.status !== "Ativa"}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {rental.status === "Ativa" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelClick(rental)}
                          >
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Nenhuma locação cadastrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar locação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta locação? O veículo e motorista (se houver) serão liberados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-destructive text-destructive-foreground">
              Cancelar Locação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}