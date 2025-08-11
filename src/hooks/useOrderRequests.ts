
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
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

// Transform order data - memoized to prevent excessive processing
const transformOrderData = (orders: any[], items: any[]): OrderRequestWithItems[] => {
  // Create items lookup map for O(1) access instead of filtering repeatedly
  const itemsMap = new Map<string, any[]>();
  for (const item of items) {
    const orderId = item.order_request_id;
    if (!itemsMap.has(orderId)) {
      itemsMap.set(orderId, []);
    }
    itemsMap.get(orderId)!.push(item);
  }

  return orders.map(order => {
    const orderItems = itemsMap.get(order.id) || [];
    const transformedItems = orderItems.map(item => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      unitOfMeasure: item.unit_of_measure,
    }));

    return {
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
      items: transformedItems,
      products: transformedItems, // Keep for backwards compatibility
    };
  });
};

export function useOrderRequests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rawData, isLoading } = useQuery({
    queryKey: ['orderRequests'],
    queryFn: async () => {
      const [ordersResult, itemsResult] = await Promise.all([
        supabase
          .from('order_requests')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('order_request_items')
          .select('*')
      ]);

      if (ordersResult.error) throw ordersResult.error;
      if (itemsResult.error) throw itemsResult.error;

      return {
        orders: ordersResult.data,
        items: itemsResult.data
      };
    },
  });

  // Memoize the expensive data transformation
  const orderRequests = useMemo(() => {
    if (!rawData) return [];
    return transformOrderData(rawData.orders, rawData.items);
  }, [rawData]);

  // Memoize mutation callbacks to prevent prop changes
  const createOrderRequest = useMutation({
    mutationFn: useCallback(async (orderData: {
      requesterName: string;
      subdistrict: string;
      products: OrderProduct[];
      observations?: string;
    }) => {
      console.log('🚀 Iniciando criação de pedido:', orderData);
      
      // Verificar autenticação
      const { data: user, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ Erro de autenticação:', userError);
        throw new Error('Usuário não autenticado: ' + userError.message);
      }
      
      if (!user.user) {
        console.error('❌ Usuário não encontrado');
        throw new Error('Usuário não autenticado');
      }
      
      console.log('✅ Usuário autenticado:', user.user.id);
      
      // Criar data local para evitar problemas de fuso horário
      const now = new Date();
      const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
      
      console.log('📅 Data do pedido:', localDate.toISOString().split('T')[0]);
      
      const orderPayload = {
        requester_name: orderData.requesterName,
        subdistrict: orderData.subdistrict,
        observations: orderData.observations,
        request_date: localDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
        created_by: user.user.id,
      };
      
      console.log('📦 Payload do pedido:', orderPayload);
      
      const { data: order, error: orderError } = await supabase
        .from('order_requests')
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) {
        console.error('❌ Erro ao criar pedido:', orderError);
        throw orderError;
      }
      
      console.log('✅ Pedido criado com sucesso:', order);

      const items = orderData.products.map(product => ({
        order_request_id: order.id,
        product_id: product.productId,
        product_name: product.productName,
        quantity: Number(product.quantity), // Convert to number to ensure type safety
        unit_of_measure: product.unitOfMeasure,
      }));
      
      console.log('📋 Items do pedido:', items);

      const { error: itemsError } = await supabase
        .from('order_request_items')
        .insert(items);

      if (itemsError) {
        console.error('❌ Erro ao criar items:', itemsError);
        throw itemsError;
      }
      
      console.log('✅ Items criados com sucesso');

      return order;
    }, []),
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['orderRequests'] });
      toast({
        title: 'Pedido criado com sucesso!',
        description: 'Seu pedido foi registrado e será processado em breve.',
      });
    }, [queryClient, toast]),
    onError: useCallback((error) => {
      console.error('Error creating order request:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar pedido',
        description: 'Ocorreu um erro ao criar seu pedido. Tente novamente.',
      });
    }, [toast]),
  });

  const updateOrderStatus = useMutation({
    mutationFn: useCallback(async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: 'approved' | 'delivered' | 'received' | 'cancelled';
    }) => {
      console.log('🔄 Iniciando atualização de status:', { orderId: orderId.substring(0, 8), status });
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log('❌ Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }
      
      console.log('👤 Usuário autenticado:', user.user.email);
      
      // Verificar o perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, is_active')
        .eq('id', user.user.id)
        .single();
      
      if (profileError || !profile) {
        console.log('❌ Erro ao buscar perfil do usuário:', profileError);
        throw new Error('Não foi possível verificar as permissões do usuário');
      }
      
      console.log('👤 Perfil do usuário:', profile);
      
      if (!profile.is_active) {
        console.log('❌ Usuário inativo');
        throw new Error('Usuário inativo');
      }
      
      if (!['admin', 'gestor_almoxarifado'].includes(profile.role)) {
        console.log('❌ Usuário sem permissão:', profile.role);
        throw new Error('Você não tem permissão para atualizar pedidos');
      }
      
      const now = new Date().toISOString();
      const updateData: Record<string, string | null | OrderStatus> = { status };
      
      if (status === 'approved') {
        updateData.approved_by = user.user.id;
        updateData.approved_at = now;
      } else if (status === 'delivered') {
        updateData.delivered_at = now;
      } else if (status === 'received') {
        updateData.received_by = user.user.id;
        updateData.received_at = now;
      }

      console.log('📝 Dados para atualização:', updateData);

      // Atualizar o pedido
      const { data: updateResult, error } = await supabase
        .from('order_requests')
        .update(updateData)
        .eq('id', orderId)
        .select();

      console.log('📊 Resultado da atualização:', { updateResult, error });

      if (error) {
        console.log('❌ Erro na atualização:', error);
        
        // Mensagens de erro mais específicas
        if (error.code === '42501' || error.code === 'PGRST301') {
          throw new Error('Erro de permissão: Verifique se as políticas RLS foram aplicadas corretamente no banco de dados.');
        } else if (error.code === '23503') {
          throw new Error('Erro de referência: O pedido pode não existir.');
        } else {
          throw new Error(`Erro ao atualizar pedido: ${error.message}`);
        }
      }

      if (!updateResult || updateResult.length === 0) {
        console.log('⚠️ Nenhum registro foi atualizado');
        throw new Error('Nenhum pedido foi encontrado para atualização');
      }

      console.log('✅ Status atualizado com sucesso:', updateResult[0]);
      return updateResult[0];
    }, []),
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['orderRequests'] });
      toast({
        title: 'Status atualizado com sucesso!',
        description: 'O status do pedido foi atualizado.',
      });
    }, [queryClient, toast]),
    onError: useCallback((error) => {
      console.error('Error updating order status:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar status',
        description: 'Ocorreu um erro ao atualizar o status do pedido.',
      });
    }, [toast]),
  });

  const deleteOrderRequest = useMutation({
    mutationFn: useCallback(async (orderId: string) => {
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
    }, []),
    onSuccess: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['orderRequests'] });
      toast({
        title: 'Pedido excluído com sucesso!',
        description: 'O pedido foi removido permanentemente.',
      });
    }, [queryClient, toast]),
    onError: useCallback((error) => {
      console.error('Error deleting order request:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir pedido',
        description: 'Ocorreu um erro ao excluir o pedido.',
      });
    }, [toast]),
  });

  // Return memoized stable object to prevent prop changes
  return useMemo(() => ({
    orderRequests,
    isLoading,
    createOrderRequest,
    updateOrderStatus,
    deleteOrderRequest,
  }), [orderRequests, isLoading, createOrderRequest, updateOrderStatus, deleteOrderRequest]);
}
