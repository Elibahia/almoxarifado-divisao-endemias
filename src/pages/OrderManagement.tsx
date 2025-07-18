
import React from 'react';
import { OrderManagement } from '@/components/OrderManagement';
import { SupervisorOrderManagement } from '@/components/SupervisorOrderManagement';
import { useAuth } from '@/hooks/useAuth';

export default function OrderManagementPage() {
  const { userProfile } = useAuth();

  // Show supervisor view for supervisor_geral role
  if (userProfile?.role === 'supervisor_geral') {
    return <SupervisorOrderManagement />;
  }

  // Show full management view for admin and gestor_almoxarifado
  return <OrderManagement />;
}
