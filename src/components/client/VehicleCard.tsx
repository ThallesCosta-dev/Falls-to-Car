import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Info, Car } from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleCardProps {
  vehicle: {
    id: string;
    modelo: string;
    placa: string;
    cor: string | null;
    ano: number | null;
    imagem_url: string | null;
    categorias_veiculo?: {
      id: string;
      nome: string;
      valor_diaria: number | string;
    } | null;
  };
  rating?: { avg: number; count: number } | null;
  isSelected: boolean;
  onSelect: () => void;
}

export function VehicleCard({ vehicle, rating, isSelected, onSelect }: VehicleCardProps) {
  const valorDiaria = typeof vehicle.categorias_veiculo?.valor_diaria === "string"
    ? parseFloat(vehicle.categorias_veiculo.valor_diaria)
    : vehicle.categorias_veiculo?.valor_diaria || 0;

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-200",
        isSelected 
          ? "ring-2 ring-primary shadow-lg" 
          : "hover:shadow-md"
      )}
    >
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{vehicle.modelo}</h3>
              <p className="text-sm text-muted-foreground">
                {vehicle.categorias_veiculo?.nome}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Vehicle Image */}
        <div className="px-4 py-2">
          <div className="aspect-[16/10] w-full flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden">
            {vehicle.imagem_url ? (
              <img
                src={vehicle.imagem_url}
                alt={vehicle.modelo}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <Car className="h-16 w-16 mb-2" />
                <span className="text-sm">Sem imagem</span>
              </div>
            )}
          </div>
        </div>

        {/* Info tags */}
        <div className="px-4 py-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span>Diária com KM Livre</span>
          {rating && (
            <>
              <span>|</span>
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span>{rating.avg} ({rating.count})</span>
              </div>
            </>
          )}
        </div>

        {/* Price */}
        <div className="px-4 py-2">
          <p className="text-xs text-muted-foreground">A partir de</p>
          <div className="flex items-baseline gap-1">
            <span className="text-sm">R$</span>
            <span className="text-3xl font-bold">{valorDiaria.toFixed(2).split('.')[0]}</span>
            <span className="text-lg">,{valorDiaria.toFixed(2).split('.')[1]}</span>
            <span className="text-muted-foreground">/dia</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="p-4 pt-2">
          <Button 
            className="w-full"
            variant={isSelected ? "default" : "outline"}
            onClick={onSelect}
          >
            {isSelected ? "Selecionado" : "Quero esse"}
          </Button>
        </div>

        {/* Details footer */}
        {(vehicle.cor || vehicle.ano) && (
          <div className="px-4 pb-4">
            <div className="flex gap-2 flex-wrap">
              {vehicle.cor && (
                <Badge variant="secondary" className="text-xs">
                  {vehicle.cor}
                </Badge>
              )}
              {vehicle.ano && (
                <Badge variant="secondary" className="text-xs">
                  {vehicle.ano}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
