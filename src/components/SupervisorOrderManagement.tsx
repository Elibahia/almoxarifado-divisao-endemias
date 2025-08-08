
import { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showNotificationToast } from '@/components/ui/notification-toast';
import { useOrderRequests, OrderRequestWithItems } from '@/hooks/useOrderRequests';
import { useAuth } from '@/hooks/useAuth';
import { useSupervisor } from '@/contexts/SupervisorContext';
import { SUBDISTRICTS } from '@/types/orderTypes';
import { useOrderFilters } from '@/hooks/useOrderFilters';
import { OrderFilters } from '@/components/orders/OrderFilters';
import { OrderSummaryCards } from '@/components/orders/OrderSummaryCards';
import { OrderTable } from '@/components/orders/OrderTable';
import { OrderMobileCards } from '@/components/orders/OrderMobileCards';

export function SupervisorOrderManagement() {
  const { orderRequests, isLoading, updateOrderStatus } = useOrderRequests();
  const { userProfile } = useAuth();
  useSupervisor();
  const [selectedOrder, setSelectedOrder] = useState<OrderRequestWithItems | null>(null);
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

  // Filter orders created by the current supervisor only
  let userOrders = orderRequests.filter(order => 
    order.createdBy === userProfile?.id
  );

  // Apply subdistrict filter
  if (subdistrictFilter !== 'all') {
    userOrders = userOrders.filter(order => order.subdistrict === subdistrictFilter);
  }

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
  } = useOrderFilters({ orders: userOrders });

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
              Meus Pedidos
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Gerencie os pedidos que você criou
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Select value={subdistrictFilter} onValueChange={setSubdistrictFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por subdistrito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os subdistritos</SelectItem>
                  {SUBDISTRICTS.map((subdistrict) => (
                  <SelectItem key={subdistrict} value={subdistrict}>
                    {subdistrict}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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
            {activeTab === 'active' ? 'Meus Pedidos Ativos' : 
             activeTab === 'completed' ? 'Meus Pedidos Atendidos' : 'Meus Pedidos Cancelados'}
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
                setSelectedOrder={setSelectedOrder}
                onStatusUpdate={handleConfirmReceipt}
                onDeleteOrder={() => Promise.resolve()} // Supervisors can't delete orders
                isPending={updateOrderStatus.isPending}
              />

              {/* Mobile Cards */}
              <OrderMobileCards
                orders={filteredOrders}
                selectedOrder={selectedOrder}
                setSelectedOrder={setSelectedOrder}
                onStatusUpdate={handleConfirmReceipt}
                onDeleteOrder={() => Promise.resolve()} // Supervisors can't delete orders
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
