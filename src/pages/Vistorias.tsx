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

interface Vistoria {
  id: string;
  veiculo_id: string;
  locacao_id: string;
  fase: string;
  nivel_tanque: string;
  quilometragem: number;
  tem_avarias: boolean | null;
  observacoes: string | null;
  responsavel_vistoria: string | null;
  data_vistoria: string | null;
  veiculos: {
    modelo: string;
    placa: string;
  };
  locacoes: {
    codigo_reserva: string;
  };
}

interface Locacao {
  id: string;
  codigo_reserva: string;
  veiculo_id: string;
  veiculos: {
    modelo: string;
    placa: string;
  };
}

export default function Vistorias() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedVistoria, setSelectedVistoria] = useState<Vistoria | null>(null);
  const [formData, setFormData] = useState({
    locacao_id: "",
    veiculo_id: "",
    fase: "",
    nivel_tanque: "",
    quilometragem: "",
    tem_avarias: false,
    observacoes: "",
    responsavel_vistoria: ""
  });

  const queryClient = useQueryClient();

  const { data: vistorias, isLoading } = useQuery({
    queryKey: ["vistorias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vistorias")
        .select("*, veiculos(modelo, placa), locacoes(codigo_reserva)")
        .order("data_vistoria", { ascending: false });
      if (error) throw error;
      return data as Vistoria[];
    },
  });

  const { data: locacoes } = useQuery({
    queryKey: ["locacoes-ativas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locacoes")
        .select("id, codigo_reserva, veiculo_id, veiculos(modelo, placa)")
        .eq("status", "Ativa")
        .order("data_reserva", { ascending: false });
      if (error) throw error;
      return data as Locacao[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("vistorias").insert([{
        ...data,
        quilometragem: parseInt(data.quilometragem)
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vistorias"] });
      toast.success("Vistoria registrada com sucesso!");
      handleCloseDialog();
    },
    onError: () => {
      toast.error("Erro ao registrar vistoria");
    },
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({
      locacao_id: "",
      veiculo_id: "",
      fase: "",
      nivel_tanque: "",
      quilometragem: "",
      tem_avarias: false,
      observacoes: "",
      responsavel_vistoria: ""
    });
  };

  const handleLocacaoChange = (locacaoId: string) => {
    const locacao = locacoes?.find(l => l.id === locacaoId);
    if (locacao) {
      setFormData({
        ...formData,
        locacao_id: locacaoId,
        veiculo_id: locacao.veiculo_id
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Layout title="Vistorias" subtitle="Gestão de vistorias">
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground">
          Total de vistorias: {vistorias?.length || 0}
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Vistoria
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Vistoria</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="locacao_id">Locação *</Label>
                  <Select
                    value={formData.locacao_id}
                    onValueChange={handleLocacaoChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma locação ativa" />
                    </SelectTrigger>
                    <SelectContent>
                      {locacoes?.map((locacao) => (
                        <SelectItem key={locacao.id} value={locacao.id}>
                          {locacao.codigo_reserva} - {locacao.veiculos.modelo} ({locacao.veiculos.placa})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fase">Fase *</Label>
                  <Select
                    value={formData.fase}
                    onValueChange={(value) => setFormData({ ...formData, fase: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a fase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Retirada">Retirada</SelectItem>
                      <SelectItem value="Devolucao">Devolução</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nivel_tanque">Nível do Tanque *</Label>
                  <Select
                    value={formData.nivel_tanque}
                    onValueChange={(value) => setFormData({ ...formData, nivel_tanque: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Reserva">Reserva</SelectItem>
                      <SelectItem value="1/4">1/4</SelectItem>
                      <SelectItem value="1/2">1/2</SelectItem>
                      <SelectItem value="3/4">3/4</SelectItem>
                      <SelectItem value="Cheio">Cheio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quilometragem">Quilometragem *</Label>
                  <Input
                    id="quilometragem"
                    type="number"
                    required
                    value={formData.quilometragem}
                    onChange={(e) => setFormData({ ...formData, quilometragem: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="responsavel_vistoria">Responsável</Label>
                  <Input
                    id="responsavel_vistoria"
                    value={formData.responsavel_vistoria}
                    onChange={(e) => setFormData({ ...formData, responsavel_vistoria: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="tem_avarias"
                      checked={formData.tem_avarias}
                      onChange={(e) => setFormData({ ...formData, tem_avarias: e.target.checked })}
                      className="rounded border-border"
                    />
                    <Label htmlFor="tem_avarias" className="cursor-pointer">Possui avarias?</Label>
                  </div>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit">Registrar</Button>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Veículo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Fase</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">KM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tanque</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Avarias</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vistorias?.map((vistoria) => (
                  <tr key={vistoria.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {vistoria.data_vistoria ? format(new Date(vistoria.data_vistoria), "dd/MM/yyyy HH:mm") : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{vistoria.locacoes.codigo_reserva}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {vistoria.veiculos.modelo} ({vistoria.veiculos.placa})
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant={vistoria.fase === "Retirada" ? "default" : "secondary"}>
                        {vistoria.fase}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{vistoria.quilometragem.toLocaleString()} km</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{vistoria.nivel_tanque}</td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant={vistoria.tem_avarias ? "destructive" : "outline"}>
                        {vistoria.tem_avarias ? "Sim" : "Não"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedVistoria(vistoria);
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
            <DialogTitle>Detalhes da Vistoria</DialogTitle>
          </DialogHeader>
          {selectedVistoria && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Locação</Label>
                  <p className="font-medium">{selectedVistoria.locacoes.codigo_reserva}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Veículo</Label>
                  <p className="font-medium">{selectedVistoria.veiculos.modelo} ({selectedVistoria.veiculos.placa})</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fase</Label>
                  <p className="font-medium">{selectedVistoria.fase}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data/Hora</Label>
                  <p className="font-medium">
                    {selectedVistoria.data_vistoria ? format(new Date(selectedVistoria.data_vistoria), "dd/MM/yyyy HH:mm") : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Quilometragem</Label>
                  <p className="font-medium">{selectedVistoria.quilometragem.toLocaleString()} km</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Nível do Tanque</Label>
                  <p className="font-medium">{selectedVistoria.nivel_tanque}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Possui Avarias?</Label>
                  <p className="font-medium">{selectedVistoria.tem_avarias ? "Sim" : "Não"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Responsável</Label>
                  <p className="font-medium">{selectedVistoria.responsavel_vistoria || "-"}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Observações</Label>
                  <p className="font-medium">{selectedVistoria.observacoes || "-"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
