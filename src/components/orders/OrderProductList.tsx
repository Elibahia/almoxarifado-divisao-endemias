import { Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderProduct } from '@/types/orderTypes';
import { Product } from '@/types';
import { OrderProductRow } from './OrderProductRow';

interface OrderProductListProps {
  products: Product[];
  orderProducts: OrderProduct[];
  onAddProduct: () => void;
  onUpdateProduct: (id: string, field: keyof OrderProduct, value: string | number) => void;
  onRemoveProduct: (id: string) => void;
}

export function OrderProductList({
  products,
  orderProducts,
  onAddProduct,
  onUpdateProduct,
  onRemoveProduct,
}: OrderProductListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Produtos Solicitados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {orderProducts.map((product, index) => (
          <OrderProductRow
            key={product.id}
            product={product}
            products={products}
            onUpdate={onUpdateProduct}
            onRemove={onRemoveProduct}
            canRemove={orderProducts.length > 1}
          />
        ))}
        
        <Button
          type="button"
          variant="outline"
          onClick={onAddProduct}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Produto
        </Button>
      </CardContent>
    </Card>
  );
}
