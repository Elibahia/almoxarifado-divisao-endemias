
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MovementType } from '@/types';
import { useToast } from '@/hooks/use-toast';

export interface Movement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number;
  reason: string;
  responsibleUser: string;
  timestamp: Date;
  notes?: string;
  invoiceNumber?: string;
  batch?: string;
}

export function useMovements() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchMovements = useCallback(async () => {
    setIsLoading(true);
    console.log('Fetching movements from Supabase...');

    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          products (
            name,
            batch
          )
        `)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching movements:', error);
        throw error;
      }

      console.log('Raw movements data:', data);

      const transformedMovements: Movement[] = (data || []).map(item => ({
        id: item.id,
        productId: item.product_id,
        productName: item.products?.name || 'Produto não encontrado',
        type: item.type as MovementType,
        quantity: Math.abs(item.quantity), // Sempre exibir valor absoluto
        reason: item.reason,
        responsibleUser: item.responsible_user,
        timestamp: new Date(item.timestamp),
        notes: item.notes,
        invoiceNumber: item.invoice_number,
        batch: item.products?.batch,
      }));

      console.log('Transformed movements:', transformedMovements);
      setMovements(transformedMovements);
    } catch (error: unknown) {
      console.error('Error in fetchMovements:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar movimentações",
        description: (error as Error)?.message || "Não foi possível carregar o histórico de movimentações.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  return {
    movements,
    isLoading,
    refetch: fetchMovements,
  };
}
