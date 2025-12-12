import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Motorista {
  id: string;
  nome: string;
  cpf: string;
  cnh: string;
  telefone: string | null;
  status: string | null;
  valor_diaria: number | null;
}

export default function Motoristas() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Motorista | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    cnh: "",
    telefone: "",
    valor_diaria: "150.00"
  });

  const queryClient = useQueryClient();

  const { data: motoristas, isLoading } = useQuery({
    queryKey: ["motoristas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("motoristas")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data as Motorista[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("motoristas").insert([{
        ...data,
        valor_diaria: parseFloat(data.valor_diaria)
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motoristas"] });
      toast.success("Motorista cadastrado com sucesso!");
      handleCloseDialog();
    },
    onError: () => {
      toast.error("Erro ao cadastrar motorista");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from("motoristas").update({
        ...data,
        valor_diaria: parseFloat(data.valor_diaria)
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motoristas"] });
      toast.success("Motorista atualizado com sucesso!");
      handleCloseDialog();
    },
    onError: () => {
      toast.error("Erro ao atualizar motorista");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("motoristas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motoristas"] });
      toast.success("Motorista excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir motorista");
    },
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingDriver(null);
    setFormData({ nome: "", cpf: "", cnh: "", telefone: "", valor_diaria: "150.00" });
  };

  const handleEdit = (motorista: Motorista) => {
    setEditingDriver(motorista);
    setFormData({
      nome: motorista.nome,
      cpf: motorista.cpf,
      cnh: motorista.cnh,
      telefone: motorista.telefone || "",
      valor_diaria: motorista.valor_diaria?.toString() || "150.00"
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      updateMutation.mutate({ id: editingDriver.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Layout title="Motoristas" subtitle="Gestão de motoristas">
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground">
          Total de motoristas: {motoristas?.length || 0}
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingDriver(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Motorista
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDriver ? "Editar Motorista" : "Novo Motorista"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  required
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cnh">CNH *</Label>
                <Input
                  id="cnh"
                  required
                  value={formData.cnh}
                  onChange={(e) => setFormData({ ...formData, cnh: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="valor_diaria">Valor Diária (R$) *</Label>
                <Input
                  id="valor_diaria"
                  type="number"
                  step="0.01"
                  required
                  value={formData.valor_diaria}
                  onChange={(e) => setFormData({ ...formData, valor_diaria: e.target.value })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingDriver ? "Atualizar" : "Cadastrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">CPF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">CNH</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Telefone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Valor Diária</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {motoristas?.map((motorista) => (
                  <tr key={motorista.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{motorista.nome}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{motorista.cpf}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{motorista.cnh}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{motorista.telefone || "-"}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      R$ {typeof motorista.valor_diaria === 'string' 
                        ? parseFloat(motorista.valor_diaria).toFixed(2) 
                        : (motorista.valor_diaria || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant={motorista.status === "Disponivel" ? "default" : "secondary"}>
                        {motorista.status || "Disponível"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(motorista)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(motorista.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
