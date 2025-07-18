
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CheckCircle,
  Clock,
  Package,
  MapPin,
  User,
  Calendar,
  FileText,
  Truck,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useOrderRequests, OrderRequestWithItems } from '@/hooks/useOrderRequests';
import { useAuth } from '@/hooks/useAuth';

const statusMap = {
  pending: { label: 'Pendente', color: 'bg-yellow-500', icon: Clock },
  approved: { label: 'Aprovado', color: 'bg-blue-500', icon: CheckCircle },
  delivered: { label: 'Entregue', color: 'bg-green-500', icon: Truck },
  cancelled: { label: 'Cancelado', color: 'bg-red-500', icon: XCircle },
} as const;

export function SupervisorOrderManagement() {
  const { orderRequests, isLoading } = useOrderRequests();
  const { userProfile } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<OrderRequestWithItems | null>(null);

  // Filter orders created by the current supervisor only
  const userOrders = orderRequests.filter(order => 
    order.createdBy === userProfile?.id
  );

  const getStatusCounts = () => {
    const counts = { pending: 0, approved: 0, delivered: 0, cancelled: 0, total: 0 };
    userOrders.forEach(order => {
      counts[order.status]++;
      counts.total++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Meus Pedidos
        </h1>
        <p className="text-muted-foreground">
          Visualize o status dos seus pedidos solicitados
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Aprovados</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Entregues</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.delivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Cancelados</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de pedidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Meus Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
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
                {userOrders.map((order) => {
                  const StatusIcon = statusMap[order.status].icon;
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
                          {format(order.requestDate, 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusMap[order.status].color} text-white`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusMap[order.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {order.items.length} item(s)
                        </span>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              Ver Detalhes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalhes do Pedido</DialogTitle>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="font-semibold">Solicitante:</label>
                                    <p>{selectedOrder.requesterName}</p>
                                  </div>
                                  <div>
                                    <label className="font-semibold">Subdistrito:</label>
                                    <p>{selectedOrder.subdistrict}</p>
                                  </div>
                                  <div>
                                    <label className="font-semibold">Data do Pedido:</label>
                                    <p>{format(selectedOrder.requestDate, 'dd/MM/yyyy', { locale: ptBR })}</p>
                                  </div>
                                  <div>
                                    <label className="font-semibold">Status:</label>
                                    <Badge className={`${statusMap[selectedOrder.status].color} text-white`}>
                                      {statusMap[selectedOrder.status].label}
                                    </Badge>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">Produtos Solicitados:</h4>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Produto</TableHead>
                                        <TableHead>Quantidade</TableHead>
                                        <TableHead>Unidade</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedOrder.items.map((item) => (
                                        <TableRow key={item.id}>
                                          <TableCell>{item.productName}</TableCell>
                                          <TableCell>{item.quantity}</TableCell>
                                          <TableCell>{item.unitOfMeasure}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>

                                {selectedOrder.observations && (
                                  <div>
                                    <label className="font-semibold">Observações:</label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {selectedOrder.observations}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
