import { Search } from 'lucide-react';
import { useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductCategory, ProductStatus } from '@/types';

interface ProductFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
}

// Mapeamento de categorias para seus respectivos rótulos
const categoryLabels = {
  [ProductCategory.GRAPHIC_MATERIALS]: 'Materiais Gráficos',
  [ProductCategory.CLEANING_MATERIALS]: 'Materiais de Limpeza',
  [ProductCategory.UNIFORMS]: 'Fardamentos',
  [ProductCategory.OFFICE_SUPPLIES]: 'Material de Escritório',
  [ProductCategory.ENDEMIC_CONTROL]: 'Controle Endemia',
  [ProductCategory.LABORATORY]: 'Laboratório',
  [ProductCategory.PERSONAL_PROTECTIVE_EQUIPMENT]: 'EPIs',
  [ProductCategory.OTHER]: 'Outros',
} as const;

// Mapeamento de status para seus respectivos rótulos
const statusLabels = {
  [ProductStatus.ACTIVE]: 'Ativo',
  [ProductStatus.LOW_STOCK]: 'Estoque Baixo',
  [ProductStatus.EXPIRED]: 'Vencido',
  [ProductStatus.OUT_OF_STOCK]: 'Esgotado',
} as const;

export function ProductFilters({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
}: ProductFiltersProps) {
  // Memoize os itens de categoria para evitar recriação em cada renderização
  const categoryItems = useMemo(() => {
    return Object.values(ProductCategory).map((category) => ({
      value: category,
      label: categoryLabels[category] || category,
    }));
  }, []);

  // Memoize os itens de status para evitar recriação em cada renderização
  const statusItems = useMemo(() => {
    return Object.values(ProductStatus).map((status) => ({
      value: status,
      label: statusLabels[status] || status,
    }));
  }, []);

  // Otimiza a mudança de termo de busca
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
    [setSearchTerm]
  );

  // Otimiza a mudança de categoria
  const handleCategoryChange = useCallback(
    (value: string) => setSelectedCategory(value),
    [setSelectedCategory]
  );

  // Otimiza a mudança de status
  const handleStatusChange = useCallback(
    (value: string) => setSelectedStatus(value),
    [setSelectedStatus]
  );
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar produtos por nome ou lote..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2">
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categoryItems.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {statusItems.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
