
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CheckCircle,
  Clock,
  Package,
  User,
  Calendar,
  Truck,
  XCircle,
  Filter,
  Download,
  SortAsc,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showNotificationToast } from '@/components/ui/notification-toast';
import { useOrderRequests, OrderRequestWithItems } from '@/hooks/useOrderRequests';
import { useAuth } from '@/hooks/useAuth';
import { useSupervisor } from '@/contexts/SupervisorContext';
import { SUBDISTRICTS } from '@/types/orderTypes';

const statusMap = {
  pending: { label: 'Pendente', color: 'bg-yellow-500', icon: Clock },
  approved: { label: 'Aprovado', color: 'bg-blue-500', icon: CheckCircle },
  delivered: { label: 'Entregue', color: 'bg-green-500', icon: Truck },
  received: { label: 'Recebido', color: 'bg-emerald-600', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-500', icon: XCircle },
} as const;

export function SupervisorOrderManagement() {
  const { orderRequests, isLoading, updateOrderStatus } = useOrderRequests();
  const { userProfile } = useAuth();
  const { selectedSubdistrict, setSelectedSubdistrict } = useSupervisor();
  const [selectedOrder, setSelectedOrder] = useState<OrderRequestWithItems | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subdistrictFilter, setSubdistrictFilter] = useState<string>('all');
  
  const handleConfirmReceipt = async (orderId: string) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status: 'received' });
      showNotificationToast({
        type: 'success',
        title: 'Recebimento Confirmado!',
        message: 'O pedido foi marcado como recebido com sucesso.',
      });
      setSelectedOrder(null); // Fechar o dialog após confirmar
    } catch (error) {
      console.error('Error confirming receipt:', error);
      showNotificationToast({
        type: 'error',
        title: 'Erro ao Confirmar Recebimento',
        message: 'Não foi possível confirmar o recebimento. Tente novamente.',
      });
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Solicitante', 'Subdistrito', 'Data', 'Status', 'Produtos', 'Observações'],
      ...filteredOrders.map(order => [
        order.requesterName,
        order.subdistrict,
        format(order.requestDate, 'dd/MM/yyyy', { locale: ptBR }),
        statusMap[order.status].label,
        order.items.map(item => `${item.productName} (${item.quantity} ${item.unitOfMeasure})`).join('; '),
        order.observations || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `meus-pedidos-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter orders created by the current supervisor only
  let userOrders = orderRequests.filter(order => 
    order.createdBy === userProfile?.id
  );

  // Apply subdistrict filter
  if (subdistrictFilter !== 'all') {
    userOrders = userOrders.filter(order => order.subdistrict === subdistrictFilter);
  }

  // Apply status filter
  if (statusFilter !== 'all') {
    userOrders = userOrders.filter(order => order.status === statusFilter);
  }

  // Apply sorting
  userOrders = userOrders.sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.requestDate).getTime();
      const dateB = new Date(b.requestDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy === 'status') {
      const statusOrder = ['pending', 'approved', 'delivered', 'received', 'cancelled'];
      const indexA = statusOrder.indexOf(a.status);
      const indexB = statusOrder.indexOf(b.status);
      return sortOrder === 'asc' ? indexA - indexB : indexB - indexA;
    }
    return 0;
  });

  const filteredOrders = userOrders;

  const getStatusCounts = () => {
    const counts = { pending: 0, approved: 0, delivered: 0, received: 0, cancelled: 0, total: 0 };
    filteredOrders.forEach(order => {
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
    <div className="container mx-auto py-4 md:py-6 px-4 max-w-7xl">
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Meus Pedidos
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Visualize o status dos seus pedidos solicitados
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex flex-wrap gap-2">
              {/* Filtro por Subdistrito */}
              <Select value={subdistrictFilter} onValueChange={setSubdistrictFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por subdistrito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os subdistritos</SelectItem>
                  {SUBDISTRICTS.map((subdistrict) => (
                    <SelectItem key={subdistrict.value} value={subdistrict.value}>
                      {subdistrict.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro por Status */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="approved">Aprovados</SelectItem>
                  <SelectItem value="delivered">Entregues</SelectItem>
                  <SelectItem value="received">Recebidos</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}
                className="flex items-center gap-1"
              >
                <SortAsc className="h-3 w-3" />
                {sortOrder === 'asc' ? 'Mais Antigos' : 'Mais Recentes'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-1"
                disabled={filteredOrders.length === 0}
              >
                <Download className="h-3 w-3" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4 md:mb-6">
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
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">Recebidos</p>
                <p className="text-2xl font-bold text-emerald-600">{statusCounts.received}</p>
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
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum pedido encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter !== 'all' || subdistrictFilter !== 'all'
                  ? 'Nenhum pedido encontrado com os filtros selecionados.'
                  : 'Crie seu primeiro pedido para começar.'
                }
              </p>
              {(statusFilter !== 'all' || subdistrictFilter !== 'all') ? (
                <div className="flex gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setStatusFilter('all');
                      setSubdistrictFilter('all');
                    }}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = '/order-requests'}
                >
                  Criar Primeiro Pedido
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
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
                            <div className="flex flex-col gap-1">
                              <Badge className={`${statusMap[order.status].color} text-white`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusMap[order.status].label}
                              </Badge>
                              {order.status === 'delivered' && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 animate-pulse">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Aguardando Confirmação
                                </Badge>
                              )}
                            </div>
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
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Detalhes do Pedido</DialogTitle>
                                  </DialogHeader>
                                  {selectedOrder && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                      </div>

                                      {selectedOrder.observations && (
                                        <div>
                                          <label className="font-semibold">Observações:</label>
                                          <p className="text-sm text-muted-foreground mt-1">
                                            {selectedOrder.observations}
                                          </p>
                                        </div>
                                      )}
                                      
                                      {selectedOrder.status === 'delivered' && (
                                        <div className="flex flex-col gap-3 pt-4 border-t">
                                          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm">
                                            <p className="font-medium mb-1">⚠️ Confirme o Recebimento</p>
                                            <p>Verifique se todos os itens foram recebidos corretamente antes de confirmar.</p>
                                          </div>
                                          <Button
                                            onClick={() => handleConfirmReceipt(selectedOrder.id)}
                                            disabled={updateOrderStatus.isPending}
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                          >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            {updateOrderStatus.isPending ? 'Confirmando...' : 'Confirmar Recebimento'}
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              
                              {order.status === 'delivered' && (
                                <Button
                                  onClick={() => handleConfirmReceipt(order.id)}
                                  disabled={updateOrderStatus.isPending}
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Confirmar Recebimento
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredOrders.map((order) => {
                  const StatusIcon = statusMap[order.status].icon;
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
                            <span>{format(order.requestDate, 'dd/MM/yyyy', { locale: ptBR })}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-2">
                          <Badge className={`${statusMap[order.status].color} text-white`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusMap[order.status].label}
                          </Badge>
                          {order.status === 'delivered' && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 animate-pulse">
                              <Clock className="h-3 w-3 mr-1" />
                              Confirmar
                            </Badge>
                          )}
                        </div>
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
                      
                      <div className="pt-3 border-t flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                              className="flex-1"
                            >
                              Ver Detalhes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Detalhes do Pedido</DialogTitle>
                            </DialogHeader>
                            <div id="supervisor-order-mobile-details-description" className="sr-only">
                              Visualização detalhada das informações do pedido do supervisor em dispositivo móvel
                            </div>
                            {selectedOrder && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                </div>

                                {selectedOrder.observations && (
                                  <div>
                                    <label className="font-semibold">Observações:</label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {selectedOrder.observations}
                                    </p>
                                  </div>
                                )}
                                
                                {selectedOrder.status === 'delivered' && (
                                  <div className="flex flex-col gap-2 pt-4">
                                    <Button
                                      onClick={() => handleConfirmReceipt(selectedOrder.id)}
                                      disabled={updateOrderStatus.isPending}
                                      className="bg-emerald-600 hover:bg-emerald-700 w-full"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Confirmar Recebimento
                                    </Button>
                                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm">
                                      <p className="font-medium">Importante:</p>
                                      <p>Confirme apenas após verificar que todos os itens foram recebidos corretamente.</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {order.status === 'delivered' && (
                          <Button
                            onClick={() => handleConfirmReceipt(order.id)}
                            disabled={updateOrderStatus.isPending}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Confirmar
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Button
        onClick={() => window.location.href = '/order-requests'}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-40"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
