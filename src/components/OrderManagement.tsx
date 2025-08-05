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
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  SortAsc,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { showNotificationToast } from '@/components/ui/notification-toast';
import { useOrderRequests, OrderRequestWithItems } from '@/hooks/useOrderRequests';
import { useAuth } from '@/hooks/useAuth';

const statusMap = {
  pending: { label: 'Pendente', color: 'bg-yellow-500', icon: Clock },
  approved: { label: 'Aprovado', color: 'bg-blue-500', icon: CheckCircle },
  delivered: { label: 'Entregue', color: 'bg-green-500', icon: Truck },
  received: { label: 'Recebido', color: 'bg-emerald-600', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-500', icon: XCircle },
} as const;

export function OrderManagement() {
  const { orderRequests, isLoading, updateOrderStatus, deleteOrderRequest } = useOrderRequests();
  const { userProfile } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<OrderRequestWithItems | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'cancelled'>('active');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleStatusUpdate = async (orderId: string, status: 'approved' | 'delivered' | 'received' | 'cancelled') => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status });
      
      const statusMessages = {
        approved: 'Pedido aprovado com sucesso!',
        delivered: 'Pedido marcado como entregue!',
        received: 'Recebimento confirmado!',
        cancelled: 'Pedido cancelado!'
      };

      showNotificationToast({
        type: 'success',
        title: 'Status Atualizado!',
        message: statusMessages[status],
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      showNotificationToast({
        type: 'error',
        title: 'Erro ao Atualizar Status',
        message: 'Não foi possível atualizar o status do pedido.',
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrderRequest.mutateAsync(orderId);
      showNotificationToast({
        type: 'success',
        title: 'Pedido Excluído!',
        message: 'O pedido foi removido com sucesso.',
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      showNotificationToast({
        type: 'error',
        title: 'Erro ao Excluir',
        message: 'Não foi possível excluir o pedido.',
      });
    }
  };

  const handleExport = (orders: OrderRequestWithItems[]) => {
    const csvContent = [
      ['Solicitante', 'Subdistrito', 'Data', 'Status', 'Produtos', 'Observações'],
      ...orders.map(order => [
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
    link.setAttribute('download', `pedidos-${activeTab}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter orders based on the active tab
  const getFilteredOrders = () => {
    let filtered = orderRequests;

    // Apply tab filter
    switch (activeTab) {
      case 'active':
        // Active orders: pending and approved (not yet delivered)
        filtered = filtered.filter(order => 
          order.status === 'pending' || order.status === 'approved'
        );
        break;
      case 'completed':
        // Completed orders: delivered and received
        filtered = filtered.filter(order => 
          order.status === 'delivered' || order.status === 'received'
        );
        break;
      case 'cancelled':
        // Only cancelled orders
        filtered = filtered.filter(order => order.status === 'cancelled');
        break;
    }

    // Apply status filter (within the tab)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply sorting
    filtered = filtered.sort((a, b) => {
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

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  const getStatusCounts = () => {
    const activeCount = orderRequests.filter(order => 
      order.status === 'pending' || order.status === 'approved'
    ).length;
    
    const completedCount = orderRequests.filter(order => 
      order.status === 'delivered' || order.status === 'received'
    ).length;
    
    const cancelledCount = orderRequests.filter(order => 
      order.status === 'cancelled'
    ).length;

    return { activeCount, completedCount, cancelledCount, total: orderRequests.length };
  };

  const statusCounts = getStatusCounts();

  const getTabStatusOptions = () => {
    switch (activeTab) {
      case 'active':
        return [
          { value: 'all', label: 'Todos' },
          { value: 'pending', label: 'Pendentes' },
          { value: 'approved', label: 'Aprovados' }
        ];
      case 'completed':
        return [
          { value: 'all', label: 'Todos' },
          { value: 'delivered', label: 'Entregues' },
          { value: 'received', label: 'Recebidos' }
        ];
      case 'cancelled':
        return [
          { value: 'all', label: 'Todos' },
          { value: 'cancelled', label: 'Cancelados' }
        ];
      default:
        return [{ value: 'all', label: 'Todos' }];
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
    <div className="container mx-auto py-4 md:py-6 px-4 max-w-7xl">
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Gerenciar Pedidos
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Gerencie todos os pedidos do sistema
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm bg-background"
              >
                {getTabStatusOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
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
                onClick={() => handleExport(filteredOrders)}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 md:mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('active')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-full ${activeTab === 'active' ? 'bg-primary' : 'bg-muted'}`}>
                <Clock className={`h-5 w-5 ${activeTab === 'active' ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pedidos Ativos</p>
                <p className={`text-2xl font-bold ${activeTab === 'active' ? 'text-primary' : 'text-foreground'}`}>
                  {statusCounts.activeCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('completed')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-full ${activeTab === 'completed' ? 'bg-primary' : 'bg-muted'}`}>
                <CheckCircle className={`h-5 w-5 ${activeTab === 'completed' ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pedidos Atendidos</p>
                <p className={`text-2xl font-bold ${activeTab === 'completed' ? 'text-primary' : 'text-foreground'}`}>
                  {statusCounts.completedCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('cancelled')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-full ${activeTab === 'cancelled' ? 'bg-primary' : 'bg-muted'}`}>
                <XCircle className={`h-5 w-5 ${activeTab === 'cancelled' ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pedidos Cancelados</p>
                <p className={`text-2xl font-bold ${activeTab === 'cancelled' ? 'text-primary' : 'text-foreground'}`}>
                  {statusCounts.cancelledCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Pedidos</p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {activeTab === 'active' ? 'Pedidos Ativos' : 
             activeTab === 'completed' ? 'Pedidos Atendidos' : 'Pedidos Cancelados'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum pedido encontrado
              </h3>
              <p className="text-muted-foreground">
                {statusFilter !== 'all' 
                  ? 'Nenhum pedido encontrado com o filtro selecionado.'
                  : `Não há ${activeTab === 'active' ? 'pedidos ativos' : 
                              activeTab === 'completed' ? 'pedidos atendidos' : 
                              'pedidos cancelados'} no momento.`
                }
              </p>
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
                      const canEdit = order.status === 'pending' || order.status === 'approved';
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
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    Ver
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
                                      
                                      {/* Status Actions */}
                                      <div className="flex flex-wrap gap-2 pt-4">
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
                                              onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                                              disabled={updateOrderStatus.isPending}
                                              variant="destructive"
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
                                        
                                        {selectedOrder.status === 'delivered' && (
                                          <Button
                                            onClick={() => handleStatusUpdate(selectedOrder.id, 'received')}
                                            disabled={updateOrderStatus.isPending}
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                          >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Confirmar Recebimento
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>

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
                                        onClick={() => handleDeleteOrder(order.id)}
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

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredOrders.map((order) => {
                  const StatusIcon = statusMap[order.status].icon;
                  const canEdit = order.status === 'pending' || order.status === 'approved';
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
                            <span>{format(order.requestDate, 'dd/MM/yyyy', { locale: ptBR })}</span>
                          </div>
                        </div>
                        <Badge className={`${statusMap[order.status].color} text-white ml-2`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusMap[order.status].label}
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                              className="flex-1"
                            >
                              <Eye className="h-3 w-3 mr-1" />
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
                                
                                {/* Status Actions */}
                                <div className="flex flex-col gap-2 pt-4">
                                  {selectedOrder.status === 'pending' && (
                                    <>
                                      <Button
                                        onClick={() => handleStatusUpdate(selectedOrder.id, 'approved')}
                                        disabled={updateOrderStatus.isPending}
                                        className="bg-blue-600 hover:bg-blue-700 w-full"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Aprovar
                                      </Button>
                                      <Button
                                        onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                                        disabled={updateOrderStatus.isPending}
                                        variant="destructive"
                                        className="w-full"
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
                                      className="bg-green-600 hover:bg-green-700 w-full"
                                    >
                                      <Truck className="h-4 w-4 mr-2" />
                                      Marcar como Entregue
                                    </Button>
                                  )}
                                  
                                  {selectedOrder.status === 'delivered' && (
                                    <Button
                                      onClick={() => handleStatusUpdate(selectedOrder.id, 'received')}
                                      disabled={updateOrderStatus.isPending}
                                      className="bg-emerald-600 hover:bg-emerald-700 w-full"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Confirmar Recebimento
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

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
                                  onClick={() => handleDeleteOrder(order.id)}
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
