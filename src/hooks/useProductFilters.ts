import { useState, useMemo, useCallback, useRef, useDeferredValue, useEffect } from 'react';
import { debounce } from 'lodash';
import { Product, ProductCategory, ProductStatus } from '@/types';
import { ProductWithUnit } from '@/types/products';

// Objetos estáticos movidos para fora do componente
const CATEGORY_LABELS = {
  [ProductCategory.GRAPHIC_MATERIALS]: 'Materiais Gráficos',
  [ProductCategory.CLEANING_MATERIALS]: 'Materiais de Limpeza',
  [ProductCategory.UNIFORMS]: 'Fardamentos',
  [ProductCategory.OFFICE_SUPPLIES]: 'Material de Escritório',
  [ProductCategory.ENDEMIC_CONTROL]: 'Controle Endemia',
  [ProductCategory.LABORATORY]: 'Laboratório',
  [ProductCategory.PERSONAL_PROTECTIVE_EQUIPMENT]: 'EPIs',
  [ProductCategory.OTHER]: 'Outros'
} as const;

const STATUS_BADGES = {
  [ProductStatus.ACTIVE]: { variant: 'outline' as const, className: 'text-success border-success', label: 'Ativo' },
  [ProductStatus.LOW_STOCK]: { variant: 'destructive' as const, className: 'bg-warning text-warning-foreground', label: 'Estoque Baixo' },
  [ProductStatus.EXPIRED]: { variant: 'destructive' as const, label: 'Vencido' },
  [ProductStatus.OUT_OF_STOCK]: { variant: 'destructive' as const, label: 'Esgotado' }
} as const;

const DEFAULT_BADGE = { variant: 'secondary' as const, label: 'Inativo' };

interface UseProductFiltersProps {
  products: ProductWithUnit[];
}

export function useProductFilters({ products }: UseProductFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Usar useDeferredValue para adiar atualizações não críticas
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const deferredCategory = useDeferredValue(selectedCategory);
  const deferredStatus = useDeferredValue(selectedStatus);

  // Função de busca otimizada
  const searchProducts = useCallback((product: ProductWithUnit, term: string) => {
    if (!term) return true;
    
    const searchLower = term.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      (product.batch && product.batch.toLowerCase().includes(searchLower))
    );
  }, []);

  // Filtragem otimizada com pré-verificação de condições
  const filteredProducts = useMemo(() => {
    const hasSearch = deferredSearchTerm.length > 0;
    const hasCategoryFilter = deferredCategory !== 'all';
    const hasStatusFilter = deferredStatus !== 'all';
    
    // Se não houver filtros ativos, retorna os produtos diretamente
    if (!hasSearch && !hasCategoryFilter && !hasStatusFilter) {
      return products;
    }

    return products.filter(product => {
      // Verifica primeiro as condições mais baratas
      if (hasCategoryFilter && product.category !== deferredCategory) return false;
      if (hasStatusFilter && product.status !== deferredStatus) return false;
      if (hasSearch && !searchProducts(product, deferredSearchTerm)) return false;
      
      return true;
    });
  }, [products, deferredSearchTerm, deferredCategory, deferredStatus, searchProducts]);

  // Funções de utilidade com useCallback
  const getCategoryLabel = useCallback((category: ProductCategory) => {
    return CATEGORY_LABELS[category] || 'Categoria Desconhecida';
  }, []);

  const getStatusBadge = useCallback((status: ProductStatus) => {
    return STATUS_BADGES[status] || DEFAULT_BADGE;
  }, []);

  const getExpirationWarning = useCallback((date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expirationDate = new Date(date);
    expirationDate.setHours(0, 0, 0, 0);
    
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration < 0) {
      return { type: 'expired' as const, message: 'Produto vencido' };
    } else if (daysUntilExpiration <= 30) {
      return { type: 'warning' as const, message: `Vence em ${daysUntilExpiration} dias` };
    } else if (daysUntilExpiration <= 90) {
      return { type: 'info' as const, message: `Vence em ${daysUntilExpiration} dias` };
    }
    return null;
  }, []);

  // Debounce para atualização do termo de busca
  const debouncedSetSearchTerm = useMemo(
    () => debounce((value: string) => setSearchTerm(value), 300),
    []
  );

  // Limpar o debounce ao desmontar
  useEffect(() => {
    return () => {
      debouncedSetSearchTerm.cancel();
    };
  }, [debouncedSetSearchTerm]);

  const handleSearchChange = useCallback((value: string) => {
    debouncedSetSearchTerm(value);
  }, [debouncedSetSearchTerm]);

  return useMemo(() => ({
    searchTerm,
    setSearchTerm: handleSearchChange,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    filteredProducts,
    getCategoryLabel,
    getStatusBadge,
    getExpirationWarning,
  }), [
    searchTerm,
    handleSearchChange,
    selectedCategory,
    selectedStatus,
    filteredProducts,
    getCategoryLabel,
    getStatusBadge,
    getExpirationWarning,
  ]);
}
