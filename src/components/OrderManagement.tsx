import { useState, useCallback } from 'react';
import { Package, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { showNotificationToast } from '@/components/ui/notification-toast';
import { useOrderRequests, OrderRequestWithItems } from '@/hooks/useOrderRequests';
import { useAuth } from '@/hooks/useAuth';
import { useOrderFilters } from '@/hooks/useOrderFilters';
import { OrderFilters } from '@/components/orders/OrderFilters';
import { OrderSummaryCards } from '@/components/orders/OrderSummaryCards';
import { OrderTable } from '@/components/orders/OrderTable';
import { OrderMobileCards } from '@/components/orders/OrderMobileCards';

export function OrderManagement() {
  const { orderRequests, isLoading, updateOrderStatus, deleteOrderRequest } = useOrderRequests();
  const { userProfile } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<OrderRequestWithItems | null>(null);

  const {
    activeTab,
    setActiveTab,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    statusFilter,
    setStatusFilter,
    filteredOrders,
    getStatusCounts,
    getTabStatusOptions,
  } = useOrderFilters({ orders: orderRequests });

  // Memoize handlers to prevent unnecessary re-renders
  const handleStatusUpdate = useCallback(async (orderId: string, status: 'approved' | 'delivered' | 'received' | 'cancelled') => {
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
  }, [updateOrderStatus]);

  const handleDeleteOrder = useCallback(async (orderId: string) => {
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
  }, [deleteOrderRequest]);

  const handleSetSelectedOrder = useCallback((order: OrderRequestWithItems | null) => {
    setSelectedOrder(order);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

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
          
          <OrderFilters
            filteredOrders={filteredOrders}
            activeTab={activeTab}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            getTabStatusOptions={getTabStatusOptions}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <OrderSummaryCards
        statusCounts={statusCounts}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

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
              <OrderTable
                orders={filteredOrders}
                selectedOrder={selectedOrder}
                setSelectedOrder={handleSetSelectedOrder}
                onStatusUpdate={handleStatusUpdate}
                onDeleteOrder={handleDeleteOrder}
                isPending={updateOrderStatus.isPending}
              />

              {/* Mobile Cards */}
              <OrderMobileCards
                orders={filteredOrders}
                selectedOrder={selectedOrder}
                setSelectedOrder={handleSetSelectedOrder}
                onStatusUpdate={handleStatusUpdate}
                onDeleteOrder={handleDeleteOrder}
                isPending={updateOrderStatus.isPending}
              />
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
