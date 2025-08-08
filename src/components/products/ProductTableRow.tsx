import React, { memo } from 'react';
import { Edit3, Trash2, AlertTriangle, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { ProductWithUnit } from '@/types/products';
import { formatDate } from '@/utils/formatDate';
import { getUnitLabel } from '@/types/unitTypes';
import { ProductStatusBadge } from './ProductStatusBadge';
import { ButtonWithLoading } from '../ui/button-with-loading';

interface ProductTableRowProps {
  product: ProductWithUnit;
  onEdit: (product: ProductWithUnit) => void;
  onDelete: (productId: string) => void;
  getCategoryLabel: (category: any) => string;
  getExpirationWarning: (date: Date) => { type: string; message: string } | null;
  isDeleting: boolean;
}

const ProductTableRow = memo(({ 
  product, 
  onEdit, 
  onDelete, 
  getCategoryLabel, 
  getExpirationWarning,
  isDeleting 
}: ProductTableRowProps) => {
  const expirationWarning = getExpirationWarning(product.expirationDate);
  
  return (
    <TableRow>
      <TableCell className="font-medium">{product.name}</TableCell>
      <TableCell>{getCategoryLabel(product.category)}</TableCell>
      <TableCell>{product.batch || '-'}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <span>{product.currentQuantity}</span>
          <span className="text-muted-foreground text-xs">
            {getUnitLabel(product.unitOfMeasure)}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {expirationWarning && (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          )}
          {formatDate(product.expirationDate)}
        </div>
        {expirationWarning && (
          <div className="text-xs text-yellow-600 mt-1">
            {expirationWarning.message}
          </div>
        )}
      </TableCell>
      <TableCell>
        <ProductStatusBadge status={product.status} />
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onEdit(product)}
            aria-label="Editar produto"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <ButtonWithLoading
            variant="outline"
            size="icon"
            onClick={() => onDelete(product.id)}
            isLoading={isDeleting}
            loadingText="Excluindo..."
            aria-label="Excluir produto"
          >
            <Trash2 className="h-4 w-4" />
          </ButtonWithLoading>
        </div>
      </TableCell>
    </TableRow>
  );
}, (prevProps, nextProps) => {
  // Comparação personalizada para evitar re-renderizações desnecessárias
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.isDeleting === nextProps.isDeleting &&
    JSON.stringify(prevProps.product) === JSON.stringify(nextProps.product)
  );
});

ProductTableRow.displayName = 'ProductTableRow';

export { ProductTableRow };
