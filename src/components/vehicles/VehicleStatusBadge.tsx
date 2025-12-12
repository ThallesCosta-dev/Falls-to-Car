import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VehicleStatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  Livre: { label: "Disponível", className: "bg-success/10 text-success border-success/20" },
  Alugado: { label: "Alugado", className: "bg-info/10 text-info border-info/20" },
  Reservado: { label: "Reservado", className: "bg-warning/10 text-warning border-warning/20" },
  Manutencao: { label: "Manutenção", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export function VehicleStatusBadge({ status }: VehicleStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.Livre;
  
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}