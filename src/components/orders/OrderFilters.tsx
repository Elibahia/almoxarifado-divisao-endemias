import { SortAsc, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrderFilters, TabType } from '@/hooks/useOrderFilters';
import { OrderRequestWithItems } from '@/hooks/useOrderRequests';
import { formatDate } from '@/utils/formatDate';
import { exportCsv } from '@/utils/exportCsv';
import { getStatusConfig } from '@/constants/orderStatus';

interface OrderFiltersProps {
  filteredOrders: OrderRequestWithItems[];
  activeTab: TabType;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
  getTabStatusOptions: () => { value: string; label: string }[];
}

export function OrderFilters({
  filteredOrders,
  activeTab,
  statusFilter,
  setStatusFilter,
  sortOrder,
  setSortOrder,
  getTabStatusOptions,
}: OrderFiltersProps) {
  const handleExport = (orders: OrderRequestWithItems[]) => {
    const headers = ['Solicitante', 'Subdistrito', 'Data', 'Status', 'Produtos', 'Observações'];
    const rows = orders.map((order) => [
      order.requesterName,
      order.subdistrict,
      formatDate(order.requestDate),
      getStatusConfig(order.status).label,
      order.items.map((item) => `${item.productName} (${item.quantity} ${item.unitOfMeasure})`).join('; '),
      order.observations || '',
    ]);
    exportCsv(headers, rows, `pedidos-${activeTab}-${formatDate(new Date(), 'yyyy-MM-dd')}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      <div className="flex flex-wrap gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1 border rounded-md text-sm bg-background"
        >
          {getTabStatusOptions().map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          }}
          className="flex items-center gap-1"
        >
          <SortAsc className="h-3 w-3" />
          {sortOrder === 'asc' ? 'Mais Antigos' : 'Mais Recentes'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport(filteredOrders)}
          className="flex items-center gap-1"
          disabled={filteredOrders.length === 0}
        >
          <Download className="h-3 w-3" />
          Exportar
        </Button>
      </div>
    </div>
  );
}
