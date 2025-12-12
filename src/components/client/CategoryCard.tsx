import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface CategoryCardProps {
  category: {
    id: string;
    nome: string;
    descricao?: string | null;
    valor_diaria: number;
  };
  vehicleCount: number;
  minPrice: number;
  maxPrice: number;
  onSelect: () => void;
}

export function CategoryCard({ category, vehicleCount, minPrice, maxPrice, onSelect }: CategoryCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
      onClick={onSelect}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{category.nome}</h3>
          {category.descricao && (
            <p className="text-sm text-muted-foreground">{category.descricao}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {vehicleCount} veículo(s) disponível(is)
          </p>
        </div>
        <div className="text-right flex items-center gap-2">
          <div>
            <p className="text-xs text-muted-foreground">A partir de</p>
            <p className="font-bold text-primary text-lg">
              R$ {minPrice.toFixed(2)}
              <span className="text-xs font-normal text-muted-foreground">/dia</span>
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
