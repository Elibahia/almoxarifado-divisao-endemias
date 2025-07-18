
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
      // Create auth user with provided password
      const { data, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name }
      });

      if (authError) throw authError;

      // The trigger will automatically create the profile, but we need to update the role
      if (data.user) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ role, name })
          .eq('id', data.user.id);

        if (updateError) throw updateError;
      }

      await fetchUsers();
      
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar usuário",
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
      // Delete from auth.users will cascade to user_profiles
      const { error } = await supabase.auth.admin.deleteUser(id);

      if (error) throw error;

      await fetchUsers();
      toast({
        title: "Sucesso",
        description: "Usuário removido com sucesso",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover usuário",
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
