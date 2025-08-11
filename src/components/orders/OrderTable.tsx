import { User, Calendar, Eye, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { OrderRequestWithItems } from '@/hooks/useOrderRequests';
import { getStatusConfig } from '@/constants/orderStatus';
import { formatDate } from '@/utils/formatDate';
import { OrderDetailsDialog } from './OrderDetailsDialog';

interface OrderTableProps {
  orders: OrderRequestWithItems[];
  selectedOrder: OrderRequestWithItems | null;
  setSelectedOrder: (order: OrderRequestWithItems | null) => void;
  onStatusUpdate: (orderId: string, status: 'approved' | 'delivered' | 'received' | 'cancelled') => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
  isPending: boolean;
}

export function OrderTable({
  orders,
  selectedOrder,
  setSelectedOrder,
  onStatusUpdate,
  onDeleteOrder,
  isPending,
}: OrderTableProps) {
  return (
    <div className="hidden md:block rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Solicitante</TableHead>
            <TableHead>Subdistrito</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Produtos</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            const canDelete = order.status === 'pending';
            
            return (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {order.requesterName}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{order.subdistrict}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(order.requestDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${statusConfig.color} text-white`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {order.items.length} item(s)
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    {/* Keep a single dialog instance controlled by selectedOrder */}
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
                            <Trash2 className="h-3 w-3 mr-1" />
                            Excluir
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
