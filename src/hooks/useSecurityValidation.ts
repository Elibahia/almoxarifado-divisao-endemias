
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function useSecurityValidation() {
  const { userProfile, user } = useAuth();
  const { toast } = useToast();

  const validateAdminAccess = (): boolean => {
    if (!user || !userProfile) {
      toast({
        title: "Acesso negado",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return false;
    }

    if (userProfile.role !== 'admin') {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem realizar esta ação",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const validateGestorAccess = (): boolean => {
    if (!user || !userProfile) {
      toast({
        title: "Acesso negado",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return false;
    }

    const allowedRoles = ['admin', 'gestor_almoxarifado'];
    if (!allowedRoles.includes(userProfile.role)) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para realizar esta ação",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const validateSupervisorAccess = (): boolean => {
    if (!user || !userProfile) {
      toast({
        title: "Acesso negado",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return false;
    }

    const allowedRoles = ['admin', 'gestor_almoxarifado', 'supervisor_geral'];
    if (!allowedRoles.includes(userProfile.role)) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para realizar esta ação",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const validateActiveUser = (): boolean => {
    if (!userProfile?.is_active) {
      toast({
        title: "Conta desativada",
        description: "Sua conta foi desativada. Entre em contato com o administrador.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return {
    validateAdminAccess,
    validateGestorAccess,
    validateSupervisorAccess,
    validateActiveUser,
  };
}
