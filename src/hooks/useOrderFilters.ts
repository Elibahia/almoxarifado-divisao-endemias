import { useState, useMemo } from 'react';
import { OrderRequestWithItems } from '@/hooks/useOrderRequests';
import { STATUS_ORDER } from '@/constants/orderStatus';
import { OrderStatus } from '@/constants/orderStatus';

export type TabType = 'active' | 'completed' | 'cancelled';
export type SortBy = 'date' | 'status';
export type SortOrder = 'asc' | 'desc';

interface UseOrderFiltersProps {
  orders: OrderRequestWithItems[];
}

export function useOrderFilters({ orders }: UseOrderFiltersProps) {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Apply tab filter
    switch (activeTab) {
      case 'active':
        filtered = filtered.filter(order => 
          order.status === 'pending' || order.status === 'approved'
        );
        break;
      case 'completed':
        filtered = filtered.filter(order => 
          order.status === 'delivered' || order.status === 'received'
        );
        break;
      case 'cancelled':
        filtered = filtered.filter(order => order.status === 'cancelled');
        break;
    }

    // Apply status filter (within the tab)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply sorting
    filtered = filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.requestDate).getTime();
        const dateB = new Date(b.requestDate).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'status') {
        const indexA = STATUS_ORDER.indexOf(a.status as OrderStatus);
        const indexB = STATUS_ORDER.indexOf(b.status as OrderStatus);
        return sortOrder === 'asc' ? indexA - indexB : indexB - indexA;
      }
      return 0;
    });

    return filtered;
  }, [orders, activeTab, statusFilter, sortBy, sortOrder]);

  const getStatusCounts = () => {
    const activeCount = orders.filter(order => 
      order.status === 'pending' || order.status === 'approved'
    ).length;
    
    const completedCount = orders.filter(order => 
      order.status === 'delivered' || order.status === 'received'
    ).length;
    
    const cancelledCount = orders.filter(order => 
      order.status === 'cancelled'
    ).length;

    return { activeCount, completedCount, cancelledCount, total: orders.length };
  };

  const getTabStatusOptions = () => {
    switch (activeTab) {
      case 'active':
        return [
          { value: 'all', label: 'Todos' },
          { value: 'pending', label: 'Pendentes' },
          { value: 'approved', label: 'Aprovados' }
        ];
      case 'completed':
        return [
          { value: 'all', label: 'Todos' },
          { value: 'delivered', label: 'Entregues' },
          { value: 'received', label: 'Recebidos' }
        ];
      case 'cancelled':
        return [
          { value: 'all', label: 'Todos' },
          { value: 'cancelled', label: 'Cancelados' }
        ];
      default:
        return [{ value: 'all', label: 'Todos' }];
    }
  };

  return {
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
  };
}
