
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'gestor_almoxarifado' | 'supervisor_geral';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (email: string, name: string, role: 'admin' | 'gestor_almoxarifado' | 'supervisor_geral', password: string) => {
    try {
      console.log('Iniciando criação de usuário:', { email, name, role });
      
      // Use the safe admin function to create user
      console.log('Chamando admin_create_user_safe...');
      const { data, error } = await supabase.rpc('admin_create_user_safe', {
        user_email: email,
        user_name: name,
        user_role: role,
        user_password: password
      });

      console.log('Resposta do admin_create_user_safe:', { data, error });

      if (error) {
        console.error('Erro ao chamar admin_create_user_safe:', error);
        throw error;
      }

      const result = data as { success: boolean; error?: string; user_id?: string };
      console.log('Resultado processado:', result);

      if (!result.success) {
        throw new Error(result.error || 'Erro desconhecido');
      }

      await fetchUsers();
      
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso!",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      let errorMessage = 'Erro ao criar usuário. Tente novamente.';
      
      if (error.message?.includes('Email já cadastrado')) {
        errorMessage = 'Este email já está cadastrado no sistema.';
      } else if (error.message?.includes('Acesso negado')) {
        errorMessage = 'Você não tem permissão para criar usuários.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error };
    }
  };

  const updateUser = async (id: string, updates: Partial<Pick<UserProfile, 'name' | 'role' | 'is_active'>>) => {
    try {
      // Build the update object explicitly to ensure proper typing
      const updateData: Record<string, any> = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.role !== undefined) updateData.role = updates.role;
      if (updates.is_active !== undefined) updateData.is_active = updates.is_active;

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await fetchUsers();
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar usuário",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const deleteUser = async (id: string) => {
    try {
      // Since we can't delete auth users from client side, we'll just deactivate the user profile
      // In a production environment, you'd want to implement this via a server-side function
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      await fetchUsers();
      toast({
        title: "Sucesso",
        description: "Usuário desativado com sucesso",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast({
        title: "Erro",
        description: "Erro ao desativar usuário",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers,
  };
}
