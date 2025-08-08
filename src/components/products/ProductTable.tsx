import { memo, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProductWithUnit } from '@/types/products';
import { ProductTableRow } from './ProductTableRow';

interface ProductTableProps {
  products: ProductWithUnit[];
  onEdit: (product: ProductWithUnit) => void;
  onDelete: (productId: string) => void;
  getCategoryLabel: (category: any) => string;
  getExpirationWarning: (date: Date) => { type: string; message: string } | null;
  isDeletingId?: string | null;
}

const ProductTable = memo(({
  products,
  onEdit,
  onDelete,
  getCategoryLabel,
  getExpirationWarning,
  isDeletingId = null,
}: ProductTableProps) => {
  const handleEdit = useCallback((product: ProductWithUnit) => onEdit(product), [onEdit]);
  const handleDelete = useCallback((productId: string) => onDelete(productId), [onDelete]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Lote</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Validade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <ProductTableRow
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
              getCategoryLabel={getCategoryLabel}
              getExpirationWarning={getExpirationWarning}
              isDeleting={isDeletingId === product.id}
            />
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Nenhum produto encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
});

ProductTable.displayName = 'ProductTable';

export { ProductTable };
export type { ProductTableProps };
