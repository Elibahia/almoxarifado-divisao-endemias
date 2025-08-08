import { useMemo, useCallback, useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProductWithUnit } from '@/types/products';
import { ProductTableRow } from './ProductTableRow';

interface VirtualizedProductTableProps {
  products: ProductWithUnit[];
  onEdit: (product: ProductWithUnit) => void;
  onDelete: (productId: string) => void;
  getCategoryLabel: (category: any) => string;
  getExpirationWarning: (date: Date) => { type: string; message: string } | null;
  isDeletingId?: string | null;
  rowHeight?: number;
  overscan?: number;
}

export function VirtualizedProductTable({
  products,
  onEdit,
  onDelete,
  getCategoryLabel,
  getExpirationWarning,
  isDeletingId = null,
  rowHeight = 73, // Altura estimada de uma linha em pixels
  overscan = 5, // Quantas linhas renderizar fora da viewport
}: VirtualizedProductTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Configuração do virtualizador
  const rowVirtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  // Ajustar tamanho quando os dados mudarem
  useEffect(() => {
    rowVirtualizer.measure();
  }, [products.length, rowVirtualizer]);

  // Função para obter um produto pelo índice virtual
  const getProduct = useCallback(
    (index: number) => products[index],
    [products]
  );

  // Calcular o tamanho total da lista virtual
  const totalSize = rowVirtualizer.getTotalSize();
  const virtualRows = rowVirtualizer.getVirtualItems();

  // Se não houver produtos, mostrar mensagem
  if (products.length === 0) {
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
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Nenhum produto encontrado
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div 
        ref={parentRef}
        className="overflow-auto"
        style={{
          height: '600px', // Altura fixa para o container de rolagem
          width: '100%',
        }}
      >
        <div
          style={{
            height: `${totalSize}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          <Table className="w-full">
            <TableHeader className="sticky top-0 z-10 bg-background">
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
            <TableBody
              style={{
                display: 'block',
                height: `${totalSize}px`,
                position: 'relative',
              }}
            >
              {virtualRows.map((virtualRow) => {
                const product = getProduct(virtualRow.index);
                return (
                  <TableRow
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <ProductTableRow
                      product={product}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      getCategoryLabel={getCategoryLabel}
                      getExpirationWarning={getExpirationWarning}
                      isDeleting={isDeletingId === product.id}
                    />
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default VirtualizedProductTable;
