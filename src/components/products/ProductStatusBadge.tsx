import { Badge } from '@/components/ui/badge';
import { ProductStatus } from '@/types';

interface ProductStatusBadgeProps {
  status: ProductStatus;
}

export function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  const getStatusConfig = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.ACTIVE:
        return { variant: 'outline', className: 'text-success border-success', label: 'Ativo' };
      case ProductStatus.LOW_STOCK:
        return { variant: 'destructive', className: 'bg-warning text-warning-foreground', label: 'Estoque Baixo' };
      case ProductStatus.EXPIRED:
        return { variant: 'destructive', label: 'Vencido' };
      case ProductStatus.OUT_OF_STOCK:
        return { variant: 'destructive', label: 'Esgotado' };
      default:
        return { variant: 'secondary', label: 'Inativo' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant as any} className={config.className}>
      {config.label}
    </Badge>
  );
}
