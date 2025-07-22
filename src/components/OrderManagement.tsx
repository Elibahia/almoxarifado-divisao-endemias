
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CheckCircle,
  Clock,
  Package,
  MapPin,
  User,
  Calendar,
  Truck,
  XCircle,
  Edit,
  Trash2,
  AlertTriangle,
  Check,
  X,
  Minus,
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
  received: { label: 'Recebido', color: 'bg-emerald-600', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-500', icon: XCircle },
} as const;

export function OrderManagement() {
  const { orderRequests, isLoading, updateOrderStatus, deleteOrderRequest } = useOrderRequests();
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderRequestWithItems | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderRequestWithItems | null>(null);
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState<OrderRequestWithItems | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'cancelled' | 'completed'>('active');
  const [itemStockStatus, setItemStockStatus] = useState<Record<string, 'available' | 'unavailable' | 'pending'>>({});

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrderRequest.mutateAsync(orderId);
      setDeleteConfirmOrder(null);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const handleEditOrder = (order: OrderRequestWithItems) => {
    setEditingOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setItemStockStatus({});
  };

  const handleStockStatusChange = (itemId: string, status: 'available' | 'unavailable' | 'pending') => {
    setItemStockStatus(prev => ({
      ...prev,
      [itemId]: status
    }));
  };

  const getApprovedItems = () => {
    if (!selectedOrder) return [];
    return selectedOrder.items.filter(item => itemStockStatus[item.id] === 'available');
  };

  const canApproveOrder = () => {
    if (!selectedOrder) return false;
    const approvedItems = getApprovedItems();
    return approvedItems.length > 0;
  };

  const handlePartialApproval = async () => {
    if (!selectedOrder) return;
    
    const approvedItems = getApprovedItems();
    if (approvedItems.length === 0) {
      alert('Selecione pelo menos um item disponível em estoque para aprovar o pedido.');
      return;
    }

    try {
      // Aqui você pode implementar a lógica para aprovar apenas os itens selecionados
      // Por enquanto, vamos aprovar o pedido inteiro
      await handleStatusUpdate(selectedOrder.id, 'approved');
      
      // Limpar o status dos itens
      setItemStockStatus({});
    } catch (error) {
      console.error('Error approving order:', error);
    }
  };

  const getFilteredOrders = () => {
    let filtered = orderRequests.filter(order => 
      selectedSubdistrict === 'all' || order.subdistrict === selectedSubdistrict
    );

    switch (activeTab) {
      case 'active':
        return filtered.filter(order => !['cancelled', 'received'].includes(order.status));
      case 'cancelled':
        return filtered.filter(order => order.status === 'cancelled');
      case 'completed':
        return filtered.filter(order => order.status === 'received');
      default:
        return filtered;
    }
  };

  const filteredOrders = getFilteredOrders();

  const getStatusCounts = () => {
    const allOrders = orderRequests.filter(order => 
      selectedSubdistrict === 'all' || order.subdistrict === selectedSubdistrict
    );
    
    const counts = { 
      pending: 0, 
      approved: 0, 
      delivered: 0, 
      received: 0, 
      cancelled: 0, 
      total: 0,
      active: 0,
      completed: 0
    };
    
    allOrders.forEach(order => {
      counts[order.status]++;
      counts.total++;
      
      if (['pending', 'approved', 'delivered'].includes(order.status)) {
        counts.active++;
      } else if (order.status === 'received') {
        counts.completed++;
      }
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

  const handleStatusUpdate = async (orderId: string, newStatus: 'approved' | 'delivered' | 'received' | 'cancelled') => {
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
    <div className="container mx-auto py-4 md:py-6 px-4 max-w-7xl">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Gerenciamento de Pedidos
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Visualize e gerencie pedidos por subdistrito
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="font-medium text-sm md:text-base">Filtrar por subdistrito:</span>
          </div>
          <Select value={selectedSubdistrict} onValueChange={setSelectedSubdistrict}>
            <SelectTrigger className="w-full sm:w-48">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4 md:mb-6">
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

      {/* Abas de navegação */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-wrap gap-2 border-b">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'active'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Pedidos Ativos ({statusCounts.active})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'completed'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Pedidos Atendidos ({statusCounts.completed})
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'cancelled'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Pedidos Cancelados ({statusCounts.cancelled})
          </button>
        </div>
      </div>

      {/* Tabela de pedidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {activeTab === 'active' && 'Pedidos Ativos'}
            {activeTab === 'completed' && 'Pedidos Atendidos'}
            {activeTab === 'cancelled' && 'Pedidos Cancelados'}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setItemStockStatus({});
                                }}
                              >
                                Ver Detalhes
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="order-details-description">
                              <DialogHeader>
                                <DialogTitle>Detalhes do Pedido</DialogTitle>
                              </DialogHeader>
                              <div id="order-details-description" className="sr-only">
                                Visualização detalhada das informações do pedido selecionado
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
                                    {selectedOrder.status === 'pending' && (
                                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                        <p className="text-sm text-blue-800 font-medium">
                                          Confirmação de Estoque
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">
                                          Marque os itens que estão disponíveis em estoque para aprovação
                                        </p>
                                      </div>
                                    )}
                                    <div className="rounded-md border overflow-x-auto">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Produto</TableHead>
                                            <TableHead>Quantidade</TableHead>
                                            <TableHead>Unidade</TableHead>
                                            {selectedOrder.status === 'pending' && (
                                              <TableHead className="text-center">Status do Estoque</TableHead>
                                            )}
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {selectedOrder.items.map((item) => {
                                            const stockStatus = itemStockStatus[item.id] || 'pending';
                                            return (
                                              <TableRow key={item.id}>
                                                <TableCell>{item.productName}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>{item.unitOfMeasure}</TableCell>
                                                {selectedOrder.status === 'pending' && (
                                                  <TableCell>
                                                    <div className="flex justify-center gap-1">
                                                      <Button
                                                        size="sm"
                                                        variant={stockStatus === 'available' ? 'default' : 'outline'}
                                                        onClick={() => handleStockStatusChange(item.id, 'available')}
                                                        className={`h-8 w-8 p-0 ${
                                                          stockStatus === 'available' 
                                                            ? 'bg-green-600 hover:bg-green-700' 
                                                            : 'hover:bg-green-50'
                                                        }`}
                                                        title="Disponível em estoque"
                                                      >
                                                        <Check className="h-4 w-4" />
                                                      </Button>
                                                      <Button
                                                        size="sm"
                                                        variant={stockStatus === 'unavailable' ? 'default' : 'outline'}
                                                        onClick={() => handleStockStatusChange(item.id, 'unavailable')}
                                                        className={`h-8 w-8 p-0 ${
                                                          stockStatus === 'unavailable' 
                                                            ? 'bg-red-600 hover:bg-red-700' 
                                                            : 'hover:bg-red-50'
                                                        }`}
                                                        title="Indisponível em estoque"
                                                      >
                                                        <X className="h-4 w-4" />
                                                      </Button>
                                                      <Button
                                                        size="sm"
                                                        variant={stockStatus === 'pending' ? 'default' : 'outline'}
                                                        onClick={() => handleStockStatusChange(item.id, 'pending')}
                                                        className={`h-8 w-8 p-0 ${
                                                          stockStatus === 'pending' 
                                                            ? 'bg-gray-600 hover:bg-gray-700' 
                                                            : 'hover:bg-gray-50'
                                                        }`}
                                                        title="Pendente verificação"
                                                      >
                                                        <Minus className="h-4 w-4" />
                                                      </Button>
                                                    </div>
                                                    <div className="text-xs text-center mt-1">
                                                      {stockStatus === 'available' && (
                                                        <span className="text-green-600 font-medium">Disponível</span>
                                                      )}
                                                      {stockStatus === 'unavailable' && (
                                                        <span className="text-red-600 font-medium">Indisponível</span>
                                                      )}
                                                      {stockStatus === 'pending' && (
                                                        <span className="text-gray-600">Pendente</span>
                                                      )}
                                                    </div>
                                                  </TableCell>
                                                )}
                                              </TableRow>
                                            );
                                          })}
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

                                  <div className="flex flex-col sm:flex-row gap-2 pt-4">
                                    {selectedOrder.status === 'pending' && (
                                      <>
                                        {/* Resumo dos itens selecionados */}
                                        <div className="w-full mb-3 p-3 bg-gray-50 rounded-md">
                                          <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div className="text-center">
                                              <div className="text-green-600 font-semibold">
                                                {selectedOrder.items.filter(item => itemStockStatus[item.id] === 'available').length}
                                              </div>
                                              <div className="text-xs text-gray-600">Disponíveis</div>
                                            </div>
                                            <div className="text-center">
                                              <div className="text-red-600 font-semibold">
                                                {selectedOrder.items.filter(item => itemStockStatus[item.id] === 'unavailable').length}
                                              </div>
                                              <div className="text-xs text-gray-600">Indisponíveis</div>
                                            </div>
                                            <div className="text-center">
                                              <div className="text-gray-600 font-semibold">
                                                {selectedOrder.items.filter(item => !itemStockStatus[item.id] || itemStockStatus[item.id] === 'pending').length}
                                              </div>
                                              <div className="text-xs text-gray-600">Pendentes</div>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                                          <Button
                                            onClick={handlePartialApproval}
                                            disabled={updateOrderStatus.isPending || !canApproveOrder()}
                                            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                                          >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Aprovar Itens Disponíveis ({getApprovedItems().length})
                                          </Button>
                                          <Button
                                            variant="destructive"
                                            onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                                            disabled={updateOrderStatus.isPending}
                                            className="w-full sm:w-auto"
                                          >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Cancelar Pedido
                                          </Button>
                                        </div>

                                        {!canApproveOrder() && (
                                          <div className="w-full mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                                            <p className="text-sm text-amber-800">
                                              Selecione pelo menos um item disponível em estoque para aprovar o pedido.
                                            </p>
                                          </div>
                                        )}
                                      </>
                                    )}
                                    {selectedOrder.status === 'approved' && (
                                      <Button
                                        onClick={() => handleStatusUpdate(selectedOrder.id, 'delivered')}
                                        disabled={updateOrderStatus.isPending}
                                        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                                      >
                                        <Truck className="h-4 w-4 mr-2" />
                                        Marcar como Entregue
                                      </Button>
                                    )}
                                    {selectedOrder.status === 'delivered' && (
                                      <div className="flex flex-col w-full sm:w-auto gap-2">
                                        <Badge className="bg-amber-500 text-white py-2 px-3 flex items-center justify-center">
                                          <Clock className="h-4 w-4 mr-2" />
                                          Aguardando Confirmação do Supervisor
                                        </Badge>
                                        <p className="text-sm text-muted-foreground text-center">
                                          O supervisor precisa confirmar o recebimento
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          {/* Botões de Editar e Deletar */}
                          {order.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditOrder(order)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteConfirmOrder(order)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
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
                  
                  <div className="pt-3 border-t space-y-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setItemStockStatus({});
                          }}
                          className="w-full"
                        >
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="order-details-mobile-description">
                        <DialogHeader>
                          <DialogTitle>Detalhes do Pedido</DialogTitle>
                        </DialogHeader>
                        <div id="order-details-mobile-description" className="sr-only">
                          Visualização detalhada das informações do pedido selecionado em dispositivo móvel
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
                              {selectedOrder.status === 'pending' && (
                                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                  <p className="text-sm text-blue-800 font-medium">
                                    Confirmação de Estoque
                                  </p>
                                  <p className="text-xs text-blue-600 mt-1">
                                    Marque os itens que estão disponíveis em estoque
                                  </p>
                                </div>
                              )}
                              <div className="space-y-3">
                                {selectedOrder.items.map((item) => {
                                  const stockStatus = itemStockStatus[item.id] || 'pending';
                                  return (
                                    <div key={item.id} className="border rounded-md p-3">
                                      <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                          <p className="font-medium">{item.productName}</p>
                                          <p className="text-sm text-gray-600">
                                            {item.quantity} {item.unitOfMeasure}
                                          </p>
                                        </div>
                                        {selectedOrder.status === 'pending' && (
                                          <div className="flex flex-col items-end gap-1">
                                            <div className="flex gap-1">
                                              <Button
                                                size="sm"
                                                variant={stockStatus === 'available' ? 'default' : 'outline'}
                                                onClick={() => handleStockStatusChange(item.id, 'available')}
                                                className={`h-7 w-7 p-0 ${
                                                  stockStatus === 'available' 
                                                    ? 'bg-green-600 hover:bg-green-700' 
                                                    : 'hover:bg-green-50'
                                                }`}
                                              >
                                                <Check className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant={stockStatus === 'unavailable' ? 'default' : 'outline'}
                                                onClick={() => handleStockStatusChange(item.id, 'unavailable')}
                                                className={`h-7 w-7 p-0 ${
                                                  stockStatus === 'unavailable' 
                                                    ? 'bg-red-600 hover:bg-red-700' 
                                                    : 'hover:bg-red-50'
                                                }`}
                                              >
                                                <X className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant={stockStatus === 'pending' ? 'default' : 'outline'}
                                                onClick={() => handleStockStatusChange(item.id, 'pending')}
                                                className={`h-7 w-7 p-0 ${
                                                  stockStatus === 'pending' 
                                                    ? 'bg-gray-600 hover:bg-gray-700' 
                                                    : 'hover:bg-gray-50'
                                                }`}
                                              >
                                                <Minus className="h-3 w-3" />
                                              </Button>
                                            </div>
                                            <div className="text-xs">
                                              {stockStatus === 'available' && (
                                                <span className="text-green-600 font-medium">Disponível</span>
                                              )}
                                              {stockStatus === 'unavailable' && (
                                                <span className="text-red-600 font-medium">Indisponível</span>
                                              )}
                                              {stockStatus === 'pending' && (
                                                <span className="text-gray-600">Pendente</span>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
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

                            <div className="flex flex-col gap-2 pt-4">
                              {selectedOrder.status === 'pending' && (
                                <>
                                  {/* Resumo dos itens selecionados - Mobile */}
                                  <div className="p-3 bg-gray-50 rounded-md">
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                      <div className="text-center">
                                        <div className="text-green-600 font-semibold">
                                          {selectedOrder.items.filter(item => itemStockStatus[item.id] === 'available').length}
                                        </div>
                                        <div className="text-xs text-gray-600">Disponíveis</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-red-600 font-semibold">
                                          {selectedOrder.items.filter(item => itemStockStatus[item.id] === 'unavailable').length}
                                        </div>
                                        <div className="text-xs text-gray-600">Indisponíveis</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-gray-600 font-semibold">
                                          {selectedOrder.items.filter(item => !itemStockStatus[item.id] || itemStockStatus[item.id] === 'pending').length}
                                        </div>
                                        <div className="text-xs text-gray-600">Pendentes</div>
                                      </div>
                                    </div>
                                  </div>

                                  <Button
                                    onClick={handlePartialApproval}
                                    disabled={updateOrderStatus.isPending || !canApproveOrder()}
                                    className="bg-blue-600 hover:bg-blue-700 w-full"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Aprovar Itens Disponíveis ({getApprovedItems().length})
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                                    disabled={updateOrderStatus.isPending}
                                    className="w-full"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancelar Pedido
                                  </Button>

                                  {!canApproveOrder() && (
                                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-md">
                                      <p className="text-sm text-amber-800">
                                        Selecione pelo menos um item disponível em estoque para aprovar o pedido.
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}
                              {selectedOrder.status === 'approved' && (
                                <Button
                                  onClick={() => handleStatusUpdate(selectedOrder.id, 'delivered')}
                                  disabled={updateOrderStatus.isPending}
                                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
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
                    
                    {/* Botões de Editar e Deletar - Mobile */}
                    {order.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditOrder(order)}
                          className="flex-1 text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirmOrder(order)}
                          className="flex-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum pedido encontrado
              </h3>
              <p className="text-muted-foreground">
                Não há pedidos para exibir com os filtros selecionados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={!!deleteConfirmOrder} onOpenChange={() => setDeleteConfirmOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirmar Exclusão
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Tem certeza que deseja excluir este pedido?</p>
            {deleteConfirmOrder && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p><strong>Solicitante:</strong> {deleteConfirmOrder.requesterName}</p>
                <p><strong>Subdistrito:</strong> {deleteConfirmOrder.subdistrict}</p>
                <p><strong>Data:</strong> {format(deleteConfirmOrder.requestDate, 'dd/MM/yyyy', { locale: ptBR })}</p>
              </div>
            )}
            <p className="text-sm text-red-600">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOrder(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirmOrder && handleDeleteOrder(deleteConfirmOrder.id)}
                disabled={deleteOrderRequest.isPending}
              >
                {deleteOrderRequest.isPending ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Pedido
            </DialogTitle>
          </DialogHeader>
          {editingOrder && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Apenas pedidos com status "Pendente" podem ser editados.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Solicitante:</label>
                  <p>{editingOrder.requesterName}</p>
                </div>
                <div>
                  <label className="font-semibold">Subdistrito:</label>
                  <p>{editingOrder.subdistrict}</p>
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
                      {editingOrder.items.map((item) => (
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
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setEditingOrder(null)}
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    // Redirecionar para página de edição ou abrir formulário de edição
                    window.location.href = `/order-requests?edit=${editingOrder.id}`;
                  }}
                >
                  Ir para Edição
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
