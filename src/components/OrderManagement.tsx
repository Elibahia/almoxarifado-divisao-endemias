
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useOrderRequests, OrderRequestWithItems } from '@/hooks/useOrderRequests';
import { SUBDISTRICTS } from '@/types/orderTypes';

const statusMap = {
  pending: { label: 'Pendente', color: 'bg-yellow-500', icon: Clock },
  approved: { label: 'Aprovado', color: 'bg-blue-500', icon: CheckCircle },
  delivered: { label: 'Entregue', color: 'bg-green-500', icon: Truck },
  cancelled: { label: 'Cancelado', color: 'bg-red-500', icon: XCircle },
};

export function OrderManagement() {
  const { orderRequests, isLoading, updateOrderStatus } = useOrderRequests();
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderRequestWithItems | null>(null);

  const filteredOrders = orderRequests.filter(order => 
    selectedSubdistrict === 'all' || order.subdistrict === selectedSubdistrict
  );

  const getStatusCounts = () => {
    const counts = { pending: 0, approved: 0, delivered: 0, cancelled: 0, total: 0 };
    filteredOrders.forEach(order => {
      counts[order.status as keyof typeof counts]++;
      counts.total++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  const handleStatusUpdate = async (orderId: string, newStatus: 'approved' | 'delivered' | 'cancelled') => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

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
          Gerenciamento de Pedidos
        </h1>
        <p className="text-muted-foreground">
          Visualize e gerencie pedidos por subdistrito
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">Filtrar por subdistrito:</span>
          </div>
          <Select value={selectedSubdistrict} onValueChange={setSelectedSubdistrict}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os subdistritos</SelectItem>
              {SUBDISTRICTS.map((sub) => (
                <SelectItem key={sub.value} value={sub.value}>
                  {sub.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
            Lista de Pedidos
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
                {filteredOrders.map((order) => {
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
                        <div className="flex gap-2">
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

                                  <div className="flex gap-2 pt-4">
                                    {selectedOrder.status === 'pending' && (
                                      <>
                                        <Button
                                          onClick={() => handleStatusUpdate(selectedOrder.id, 'approved')}
                                          disabled={updateOrderStatus.isPending}
                                          className="bg-blue-600 hover:bg-blue-700"
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Aprovar
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                                          disabled={updateOrderStatus.isPending}
                                        >
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Cancelar
                                        </Button>
                                      </>
                                    )}
                                    {selectedOrder.status === 'approved' && (
                                      <Button
                                        onClick={() => handleStatusUpdate(selectedOrder.id, 'delivered')}
                                        disabled={updateOrderStatus.isPending}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <Truck className="h-4 w-4 mr-2" />
                                        Marcar como Entregue
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
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
