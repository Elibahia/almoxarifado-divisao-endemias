import { User, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { OrderRequestWithItems } from '@/hooks/useOrderRequests';
import { getStatusConfig } from '@/constants/orderStatus';
import { formatDate } from '@/utils/formatDate';
import { OrderStatusActions } from './OrderStatusActions';

interface OrderDetailsDialogProps {
  order: OrderRequestWithItems | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: 'approved' | 'delivered' | 'received' | 'cancelled') => Promise<void>;
  isPending: boolean;
}

export function OrderDetailsDialog({
  order,
  isOpen,
  onClose,
  onStatusUpdate,
  isPending,
}: OrderDetailsDialogProps) {
  if (!order) return null;

  const statusConfig = getStatusConfig(order.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Solicitante:</label>
              <p>{order.requesterName}</p>
            </div>
            <div>
              <label className="font-semibold">Subdistrito:</label>
              <p>{order.subdistrict}</p>
            </div>
            <div>
              <label className="font-semibold">Data do Pedido:</label>
              <p>{formatDate(order.requestDate)}</p>
            </div>
            <div>
              <label className="font-semibold">Status:</label>
              <Badge className={`${statusConfig.color} text-white`}>
                {statusConfig.label}
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Produtos Solicitados:</h4>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Unidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unitOfMeasure}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {order.observations && (
            <div>
              <label className="font-semibold">Observações:</label>
              <p className="text-sm text-muted-foreground mt-1">
                {order.observations}
              </p>
            </div>
          )}
          
          <OrderStatusActions
            order={order}
            onStatusUpdate={onStatusUpdate}
            isPending={isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
