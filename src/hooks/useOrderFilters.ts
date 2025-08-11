import { useState, useMemo, useCallback } from 'react';
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

  // Memoize status counts to avoid expensive recalculation
  const statusCounts = useMemo(() => {
    const counts = { active: 0, completed: 0, cancelled: 0, total: orders.length };
    
    for (const order of orders) {
      if (order.status === 'pending' || order.status === 'approved') {
        counts.active++;
      } else if (order.status === 'delivered' || order.status === 'received') {
        counts.completed++;
      } else if (order.status === 'cancelled') {
        counts.cancelled++;
      }
    }
    
    return counts;
  }, [orders]);

  // Memoize expensive filtering and sorting operations
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Apply tab filter with optimized condition check
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

    // Apply sorting with optimized comparisons
    if (sortBy === 'date') {
      filtered = filtered.sort((a, b) => {
        const dateA = new Date(a.requestDate).getTime();
        const dateB = new Date(b.requestDate).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (sortBy === 'status') {
      filtered = filtered.sort((a, b) => {
        const indexA = STATUS_ORDER.indexOf(a.status as OrderStatus);
        const indexB = STATUS_ORDER.indexOf(b.status as OrderStatus);
        return sortOrder === 'asc' ? indexA - indexB : indexB - indexA;
      });
    }

    return filtered;
  }, [orders, activeTab, statusFilter, sortBy, sortOrder]);

  // Memoize function returning status counts to prevent object recreation
  const getStatusCounts = useCallback(() => {
    return {
      activeCount: statusCounts.active,
      completedCount: statusCounts.completed,
      cancelledCount: statusCounts.cancelled,
      total: statusCounts.total
    };
  }, [statusCounts]);

  // Memoize tab status options to prevent array recreation
  const getTabStatusOptions = useCallback(() => {
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
  }, [activeTab]);

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
