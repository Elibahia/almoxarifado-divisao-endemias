import { CheckCircle, XCircle, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderRequestWithItems } from '@/hooks/useOrderRequests';

interface OrderStatusActionsProps {
  order: OrderRequestWithItems;
  onStatusUpdate: (orderId: string, status: 'approved' | 'delivered' | 'received' | 'cancelled') => Promise<void>;
  isPending: boolean;
  isMobile?: boolean;
}

export function OrderStatusActions({
  order,
  onStatusUpdate,
  isPending,
  isMobile = false,
}: OrderStatusActionsProps) {
  const buttonClassName = isMobile ? "w-full" : "";

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-wrap'} gap-2 pt-4`}>
      {order.status === 'pending' && (
        <>
          <Button
            onClick={() => onStatusUpdate(order.id, 'approved')}
            disabled={isPending}
            className={`bg-blue-600 hover:bg-blue-700 ${buttonClassName}`}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Aprovar
          </Button>
          <Button
            onClick={() => onStatusUpdate(order.id, 'cancelled')}
            disabled={isPending}
            variant="destructive"
            className={buttonClassName}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </>
      )}
      
      {order.status === 'approved' && (
        <Button
          onClick={() => onStatusUpdate(order.id, 'delivered')}
          disabled={isPending}
          className={`bg-green-600 hover:bg-green-700 ${buttonClassName}`}
        >
          <Truck className="h-4 w-4 mr-2" />
          Marcar como Entregue
        </Button>
      )}
      
      {order.status === 'delivered' && (
        <Button
          onClick={() => onStatusUpdate(order.id, 'received')}
          disabled={isPending}
          className={`bg-emerald-600 hover:bg-emerald-700 ${buttonClassName}`}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Confirmar Recebimento
        </Button>
      )}
    </div>
  );
}
