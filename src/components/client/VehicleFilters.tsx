import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  nome: string;
  valor_diaria: number;
}

interface VehicleFiltersProps {
  categories: Category[] | undefined;
  filters: {
    categoria: string;
    precoMin: string;
    precoMax: string;
    cor: string;
    anoMin: string;
  };
  onFilterChange: (filters: VehicleFiltersProps["filters"]) => void;
}

export function VehicleFilters({ categories, filters, onFilterChange }: VehicleFiltersProps) {
  const hasFilters = filters.categoria || filters.precoMin || filters.precoMax || filters.cor || filters.anoMin;

  const clearFilters = () => {
    onFilterChange({
      categoria: "",
      precoMin: "",
      precoMax: "",
      cor: "",
      anoMin: "",
    });
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4" />
          <span className="font-medium text-sm">Filtros</span>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto h-7 px-2">
              <X className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label className="text-xs">Categoria</Label>
            <Select
              value={filters.categoria}
              onValueChange={(value) => onFilterChange({ ...filters, categoria: value })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Preço mín.</Label>
            <Input
              type="number"
              placeholder="R$ 0"
              className="h-9"
              value={filters.precoMin}
              onChange={(e) => onFilterChange({ ...filters, precoMin: e.target.value })}
            />
          </div>

          <div>
            <Label className="text-xs">Preço máx.</Label>
            <Input
              type="number"
              placeholder="R$ 999"
              className="h-9"
              value={filters.precoMax}
              onChange={(e) => onFilterChange({ ...filters, precoMax: e.target.value })}
            />
          </div>

          <div>
            <Label className="text-xs">Cor</Label>
            <Input
              placeholder="Ex: Preto"
              className="h-9"
              value={filters.cor}
              onChange={(e) => onFilterChange({ ...filters, cor: e.target.value })}
            />
          </div>

          <div>
            <Label className="text-xs">Ano mínimo</Label>
            <Input
              type="number"
              placeholder="2020"
              className="h-9"
              value={filters.anoMin}
              onChange={(e) => onFilterChange({ ...filters, anoMin: e.target.value })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
