import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { OrderProduct } from '@/types/orderTypes';
import { Product } from '@/types';
import { UNIT_OF_MEASURE_OPTIONS } from '@/types/unitTypes';
import { memo } from 'react';

interface OrderProductRowProps {
  product: OrderProduct;
  products: Product[];
  onUpdate: (id: string, field: keyof OrderProduct, value: string | number) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export const OrderProductRow = memo(function OrderProductRow({
  product,
  products,
  onUpdate,
  onRemove,
  canRemove,
}: OrderProductRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
      <div>
        <label className="text-sm font-medium">Produto</label>
        <Select
          value={product.productId}
          onValueChange={(value) => onUpdate(product.id, 'productId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o produto" />
          </SelectTrigger>
          <SelectContent>
            {products.map((prod) => (
              <SelectItem key={prod.id} value={prod.id}>
                {prod.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Quantidade</label>
        <Input
          type="number"
          min="1"
          value={product.quantity}
          onChange={(e) => onUpdate(product.id, 'quantity', parseInt(e.target.value) || 1)}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Unidade</label>
        <Select
          value={product.unitOfMeasure}
          onValueChange={(value) => onUpdate(product.id, 'unitOfMeasure', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UNIT_OF_MEASURE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end">
        {canRemove && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRemove(product.id)}
            className="w-full"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
});
