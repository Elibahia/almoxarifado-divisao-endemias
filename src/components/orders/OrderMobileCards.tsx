import { User, Calendar, Eye, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { OrderRequestWithItems } from '@/hooks/useOrderRequests';
import { getStatusConfig } from '@/constants/orderStatus';
import { formatDate } from '@/utils/formatDate';
import { OrderDetailsDialog } from './OrderDetailsDialog';

interface OrderMobileCardsProps {
  orders: OrderRequestWithItems[];
  selectedOrder: OrderRequestWithItems | null;
  setSelectedOrder: (order: OrderRequestWithItems | null) => void;
  onStatusUpdate: (orderId: string, status: 'approved' | 'delivered' | 'received' | 'cancelled') => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
  isPending: boolean;
}

export function OrderMobileCards({
  orders,
  selectedOrder,
  setSelectedOrder,
  onStatusUpdate,
  onDeleteOrder,
  isPending,
}: OrderMobileCardsProps) {
  return (
    <div className="md:hidden space-y-4">
      {orders.map((order) => {
        const statusConfig = getStatusConfig(order.status);
        const StatusIcon = statusConfig.icon;
        const canDelete = order.status === 'pending';
        
        return (
          <Card key={order.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium text-foreground truncate">{order.requesterName}</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(order.requestDate)}</span>
                </div>
              </div>
              <Badge className={`${statusConfig.color} text-white ml-2`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div>
                <span className="text-muted-foreground">Subdistrito:</span>
                <div className="mt-1">
                  <Badge variant="outline">{order.subdistrict}</Badge>
                </div>
              </div>
              
              <div>
                <span className="text-muted-foreground">Produtos:</span>
                <div className="mt-1 text-foreground">
                  {order.items.length} item(s)
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrder(order)}
                className="flex-1"
              >
                <Eye className="h-3 w-3 mr-1" />
                Ver Detalhes
              </Button>
              {/* Single controlled dialog instance */}
              <OrderDetailsDialog
                order={selectedOrder}
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onStatusUpdate={onStatusUpdate}
                isPending={isPending}
              />

              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza de que deseja excluir este pedido? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeleteOrder(order.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
