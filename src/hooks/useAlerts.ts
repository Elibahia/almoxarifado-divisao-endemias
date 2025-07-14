
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Alert {
  id: string;
  type: string;
  product_id: string;
  message: string;
  severity: string;
  is_read: boolean;
  created_at: string;
  products?: {
    name: string;
    category: string;
  };
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          *,
          products (
            name,
            category
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar alertas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar alerta como lido",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;
      
      setAlerts(prev => prev.map(alert => ({ ...alert, is_read: true })));
      
      toast({
        title: "Sucesso",
        description: "Todos os alertas foram marcados como lidos",
      });
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar alertas como lidos",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return {
    alerts,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchAlerts,
  };
}
