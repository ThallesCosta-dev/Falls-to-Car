import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Car, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { VehicleStatusBadge } from "@/components/vehicles/VehicleStatusBadge";
import { VehicleImageUpload } from "@/components/vehicles/VehicleImageUpload";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";

export default function Veiculos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const form = useForm({
    defaultValues: {
      modelo: "",
      placa: "",
      categoria_id: "",
      loja_atual_id: "",
      ano: new Date().getFullYear(),
      cor: "",
    },
  });

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("veiculos")
        .select(`
          *,
          categorias_veiculo(nome, valor_diaria),
          lojas(nome, cidades(nome, uf))
        `)
        .order("created_at", { ascending: false });
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categorias_veiculo")
        .select("*")
        .order("nome");
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

  const createVehicle = useMutation({
    mutationFn: async (values: any) => {
      if (!imageUrl) {
        throw new Error("Imagem obrigatória");
      }
      const { error } = await supabase.from("veiculos").insert({
        ...values,
        imagem_url: imageUrl,
        status: "Livre",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast({
        title: "Veículo cadastrado",
        description: "O veículo foi adicionado com sucesso.",
      });
      form.reset();
      setImageUrl(null);
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível cadastrar o veículo.",
        variant: "destructive",
      });
    },
  });

  const updateVehicle = useMutation({
    mutationFn: async (values: any) => {
      if (!imageUrl) {
        throw new Error("Imagem obrigatória");
      }
      const { error } = await supabase
        .from("veiculos")
        .update({ ...values, imagem_url: imageUrl })
        .eq("id", editingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast({
        title: "Veículo atualizado",
        description: "O veículo foi atualizado com sucesso.",
      });
      form.reset();
      setImageUrl(null);
      setOpen(false);
      setEditingId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o veículo.",
        variant: "destructive",
      });
    },
  });

  const deleteVehicle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("veiculos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast({
        title: "Veículo excluído",
        description: "O veículo foi removido com sucesso.",
      });
      setDeleteDialogOpen(false);
      setVehicleToDelete(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o veículo. Verifique se não há locações vinculadas.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (vehicleId: string) => {
    setVehicleToDelete(vehicleId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (vehicleToDelete) {
      deleteVehicle.mutate(vehicleToDelete);
    }
  };

  const handleEdit = (vehicle: any) => {
    setEditingId(vehicle.id);
    setImageUrl(vehicle.imagem_url);
    form.reset({
      modelo: vehicle.modelo,
      placa: vehicle.placa,
      categoria_id: vehicle.categoria_id,
      loja_atual_id: vehicle.loja_atual_id,
      ano: vehicle.ano,
      cor: vehicle.cor,
    });
    setOpen(true);
  };

  const handleSubmit = (values: any) => {
    if (editingId) {
      updateVehicle.mutate(values);
    } else {
      createVehicle.mutate(values);
    }
  };

  useEffect(() => {
    if (!open) {
      setEditingId(null);
      setImageUrl(null);
      form.reset({
        modelo: "",
        placa: "",
        categoria_id: "",
        loja_atual_id: "",
        ano: new Date().getFullYear(),
        cor: "",
      });
    }
  }, [open]);

  return (
    <Layout 
      title="Gestão de Veículos" 
      subtitle="Controle completo da frota de veículos"
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Veículo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Veículo" : "Cadastrar Novo Veículo"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="modelo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Toyota Corolla" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="placa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Placa</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="ABC-1234" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="categoria_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.nome}
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
                      name="loja_atual_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loja</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {stores?.map((store) => (
                                <SelectItem key={store.id} value={store.id}>
                                  {store.nome} - {store.cidades?.nome}/{store.cidades?.uf}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ano"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ano</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Preto" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <VehicleImageUpload
                    value={imageUrl}
                    onChange={setImageUrl}
                    required
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createVehicle.isPending || updateVehicle.isPending || !imageUrl}
                    >
                      {createVehicle.isPending || updateVehicle.isPending ? "Salvando..." : "Salvar"}
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
                <TableHead className="w-16">Foto</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Valor/Dia</TableHead>
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
              ) : vehicles?.length ? (
                vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      {vehicle.imagem_url ? (
                        <img
                          src={vehicle.imagem_url}
                          alt={vehicle.modelo}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <Car className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{vehicle.modelo}</TableCell>
                    <TableCell>{vehicle.placa}</TableCell>
                    <TableCell>{vehicle.categorias_veiculo?.nome}</TableCell>
                    <TableCell>
                      {vehicle.lojas?.nome}
                      <span className="text-muted-foreground">
                        {" "}• {vehicle.lojas?.cidades?.nome}/{vehicle.lojas?.cidades?.uf}
                      </span>
                    </TableCell>
                    <TableCell>
                      R$ {(() => {
                        const valor = typeof vehicle.categorias_veiculo?.valor_diaria === 'string' 
                          ? parseFloat(vehicle.categorias_veiculo?.valor_diaria) 
                          : (vehicle.categorias_veiculo?.valor_diaria || 0);
                        return valor.toFixed(2);
                      })()}
                    </TableCell>
                    <TableCell>
                      <VehicleStatusBadge status={vehicle.status || "Livre"} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(vehicle)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(vehicle.id)}
                          disabled={vehicle.status === "Alugado"}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Nenhum veículo cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}