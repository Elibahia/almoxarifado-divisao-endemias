
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OrderRequest, OrderProduct } from '@/types/orderTypes';
import type { OrderStatus } from '@/constants/orderStatus';
import { useToast } from '@/hooks/use-toast';

export interface OrderRequestWithItems extends OrderRequest {
  id: string;
  status: OrderStatus;
  createdBy: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  deliveredAt: string | null;
  receivedAt: string | null;
  receivedBy: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderProduct[];
}

export function useOrderRequests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orderRequests = [], isLoading } = useQuery({
    queryKey: ['orderRequests'],
    queryFn: async () => {
      const { data: orders, error: ordersError } = await supabase
        .from('order_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const { data: items, error: itemsError } = await supabase
        .from('order_request_items')
        .select('*');

      if (itemsError) throw itemsError;

      return orders.map(order => ({
        id: order.id,
        requesterName: order.requester_name,
        subdistrict: order.subdistrict,
        requestDate: order.request_date ? new Date(order.request_date + 'T00:00:00') : new Date(),
        observations: order.observations,
        status: order.status as OrderStatus,
        createdBy: order.created_by,
        approvedBy: order.approved_by,
        approvedAt: order.approved_at,
        deliveredAt: order.delivered_at,
        receivedAt: order.received_at,
        receivedBy: order.received_by,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        items: items
          .filter(item => item.order_request_id === order.id)
          .map(item => ({
            id: item.id,
            productId: item.product_id,
            productName: item.product_name,
            quantity: item.quantity,
            unitOfMeasure: item.unit_of_measure,
          })),
        products: items
          .filter(item => item.order_request_id === order.id)
          .map(item => ({
            id: item.id,
            productId: item.product_id,
            productName: item.product_name,
            quantity: item.quantity,
            unitOfMeasure: item.unit_of_measure,
          })),
      })) as OrderRequestWithItems[];
    },
  });

  const createOrderRequest = useMutation({
    mutationFn: async (orderData: {
      requesterName: string;
      subdistrict: string;
      products: OrderProduct[];
      observations?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      
      // Criar data local para evitar problemas de fuso horário
      const now = new Date();
      const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
      
      const { data: order, error: orderError } = await supabase
        .from('order_requests')
        .insert({
          requester_name: orderData.requesterName,
          subdistrict: orderData.subdistrict,
          observations: orderData.observations,
          request_date: localDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
          created_by: user.user?.id,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const items = orderData.products.map(product => ({
        order_request_id: order.id,
        product_id: product.productId,
        product_name: product.productName,
        quantity: Number(product.quantity), // Convert to number to ensure type safety
        unit_of_measure: product.unitOfMeasure,
      }));

      const { error: itemsError } = await supabase
        .from('order_request_items')
        .insert(items);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderRequests'] });
      toast({
        title: 'Pedido criado com sucesso!',
        description: 'Seu pedido foi registrado e será processado em breve.',
      });
    },
    onError: (error) => {
      console.error('Error creating order request:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar pedido',
        description: 'Ocorreu um erro ao criar seu pedido. Tente novamente.',
      });
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: 'approved' | 'delivered' | 'received' | 'cancelled';
    }) => {
      const { data: user } = await supabase.auth.getUser();
      const now = new Date().toISOString();
      
      const updateData: Record<string, string | null | OrderStatus> = { status };
      
      if (status === 'approved') {
        updateData.approved_by = user.user?.id;
        updateData.approved_at = now;
      } else if (status === 'delivered') {
        updateData.delivered_at = now;
      } else if (status === 'received') {
        updateData.received_by = user.user?.id;
        updateData.received_at = now;
      }

      const { error } = await supabase
        .from('order_requests')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderRequests'] });
      toast({
        title: 'Status atualizado com sucesso!',
        description: 'O status do pedido foi atualizado.',
      });
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar status',
        description: 'Ocorreu um erro ao atualizar o status do pedido.',
      });
    },
  });

  const deleteOrderRequest = useMutation({
    mutationFn: async (orderId: string) => {
      // First delete the order items
      const { error: itemsError } = await supabase
        .from('order_request_items')
        .delete()
        .eq('order_request_id', orderId);

      if (itemsError) throw itemsError;

      // Then delete the order
      const { error: orderError } = await supabase
        .from('order_requests')
        .delete()
        .eq('id', orderId);

      if (orderError) throw orderError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderRequests'] });
      toast({
        title: 'Pedido excluído com sucesso!',
        description: 'O pedido foi removido permanentemente.',
      });
    },
    onError: (error) => {
      console.error('Error deleting order request:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir pedido',
        description: 'Ocorreu um erro ao excluir o pedido.',
      });
    },
  });

  return {
    orderRequests,
    isLoading,
    createOrderRequest,
    updateOrderStatus,
    deleteOrderRequest,
  };
}
