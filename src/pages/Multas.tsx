import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Multa {
  id: string;
  locacao_id: string;
  tipo_multa_id: string;
  valor_cobrado: number;
  data_infracao: string | null;
  observacoes: string | null;
  status_pagamento: string | null;
  locacoes: {
    codigo_reserva: string;
    clientes: {
      nome: string;
    };
  };
  tipos_multa: {
    descricao: string;
    gravidade: string | null;
  };
}

interface TipoMulta {
  id: string;
  descricao: string;
  gravidade: string | null;
  valor_referencia: number | null;
}

interface Locacao {
  id: string;
  codigo_reserva: string;
  clientes: {
    nome: string;
  };
}

export default function Multas() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedMulta, setSelectedMulta] = useState<Multa | null>(null);
  const [formData, setFormData] = useState({
    locacao_id: "",
    tipo_multa_id: "",
    valor_cobrado: "",
    observacoes: ""
  });

  const queryClient = useQueryClient();

  const { data: multas, isLoading } = useQuery({
    queryKey: ["multas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("multas")
        .select("*, locacoes(codigo_reserva, clientes(nome)), tipos_multa(descricao, gravidade)")
        .order("data_infracao", { ascending: false });
      if (error) throw error;
      return data as Multa[];
    },
  });

  const { data: tiposMulta } = useQuery({
    queryKey: ["tipos-multa"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tipos_multa")
        .select("*")
        .order("descricao");
      if (error) throw error;
      return data as TipoMulta[];
    },
  });

  const { data: locacoes } = useQuery({
    queryKey: ["locacoes-ativas-multas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locacoes")
        .select("id, codigo_reserva, clientes(nome)")
        .order("data_reserva", { ascending: false });
      if (error) throw error;
      return data as Locacao[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("multas").insert([{
        ...data,
        valor_cobrado: parseFloat(data.valor_cobrado)
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["multas"] });
      toast.success("Multa aplicada com sucesso!");
      handleCloseDialog();
    },
    onError: () => {
      toast.error("Erro ao aplicar multa");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("multas").update({ status_pagamento: status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["multas"] });
      toast.success("Status atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    },
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({
      locacao_id: "",
      tipo_multa_id: "",
      valor_cobrado: "",
      observacoes: ""
    });
  };

  const handleTipoMultaChange = (tipoId: string) => {
    const tipo = tiposMulta?.find(t => t.id === tipoId);
    setFormData({
      ...formData,
      tipo_multa_id: tipoId,
      valor_cobrado: tipo?.valor_referencia?.toString() || ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getGravidadeBadge = (gravidade: string | null) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "Baixa": "outline",
      "Media": "secondary",
      "Grave": "default",
      "Gravissima": "destructive",
      "Contratual": "secondary"
    };
    return <Badge variant={variants[gravidade || "Contratual"] || "outline"}>{gravidade || "Contratual"}</Badge>;
  };

  return (
    <Layout title="Multas" subtitle="Gestão de multas">
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground">
          Total de multas: {multas?.length || 0}
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Aplicar Multa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Aplicar Multa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="locacao_id">Locação *</Label>
                <Select
                  value={formData.locacao_id}
                  onValueChange={(value) => setFormData({ ...formData, locacao_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma locação" />
                  </SelectTrigger>
                  <SelectContent>
                    {locacoes?.map((locacao) => (
                      <SelectItem key={locacao.id} value={locacao.id}>
                        {locacao.codigo_reserva} - {locacao.clientes.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tipo_multa_id">Tipo de Multa *</Label>
                <Select
                  value={formData.tipo_multa_id}
                  onValueChange={handleTipoMultaChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposMulta?.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        {tipo.descricao} - {tipo.gravidade} - R$ {typeof tipo.valor_referencia === 'string' 
                          ? parseFloat(tipo.valor_referencia).toFixed(2)
                          : (tipo.valor_referencia || 0).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="valor_cobrado">Valor Cobrado (R$) *</Label>
                <Input
                  id="valor_cobrado"
                  type="number"
                  step="0.01"
                  required
                  value={formData.valor_cobrado}
                  onChange={(e) => setFormData({ ...formData, valor_cobrado: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit">Aplicar</Button>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Locação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Gravidade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {multas?.map((multa) => (
                  <tr key={multa.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {multa.data_infracao ? format(new Date(multa.data_infracao), "dd/MM/yyyy") : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{multa.locacoes.codigo_reserva}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{multa.locacoes.clientes.nome}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{multa.tipos_multa.descricao}</td>
                    <td className="px-6 py-4 text-sm">{getGravidadeBadge(multa.tipos_multa.gravidade)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      R$ {typeof multa.valor_cobrado === 'string' 
                        ? parseFloat(multa.valor_cobrado).toFixed(2)
                        : (multa.valor_cobrado || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant={multa.status_pagamento === "Pago" ? "default" : "secondary"}>
                        {multa.status_pagamento || "Pendente"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedMulta(multa);
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Multa</DialogTitle>
          </DialogHeader>
          {selectedMulta && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Locação</Label>
                  <p className="font-medium">{selectedMulta.locacoes.codigo_reserva}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Cliente</Label>
                  <p className="font-medium">{selectedMulta.locacoes.clientes.nome}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo de Multa</Label>
                  <p className="font-medium">{selectedMulta.tipos_multa.descricao}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Gravidade</Label>
                  <div className="mt-1">{getGravidadeBadge(selectedMulta.tipos_multa.gravidade)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data da Infração</Label>
                  <p className="font-medium">
                    {selectedMulta.data_infracao ? format(new Date(selectedMulta.data_infracao), "dd/MM/yyyy") : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Valor Cobrado</Label>
                  <p className="font-medium text-lg">
                    R$ {typeof selectedMulta.valor_cobrado === 'string' 
                      ? parseFloat(selectedMulta.valor_cobrado).toFixed(2)
                      : (selectedMulta.valor_cobrado || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status do Pagamento</Label>
                  <div className="mt-1">
                    <Badge variant={selectedMulta.status_pagamento === "Pago" ? "default" : "secondary"}>
                      {selectedMulta.status_pagamento || "Pendente"}
                    </Badge>
                  </div>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Observações</Label>
                  <p className="font-medium">{selectedMulta.observacoes || "-"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
