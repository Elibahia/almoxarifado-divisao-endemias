import { Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TabType } from '@/hooks/useOrderFilters';

interface OrderSummaryCardsProps {
  statusCounts: {
    activeCount: number;
    completedCount: number;
    cancelledCount: number;
    total: number;
  };
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function OrderSummaryCards({
  statusCounts,
  activeTab,
  setActiveTab,
}: OrderSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 md:mb-6">
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow" 
        onClick={() => setActiveTab('active')}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${activeTab === 'active' ? 'bg-primary' : 'bg-muted'}`}>
              <Clock className={`h-5 w-5 ${activeTab === 'active' ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pedidos Ativos</p>
              <p className={`text-2xl font-bold ${activeTab === 'active' ? 'text-primary' : 'text-foreground'}`}>
                {statusCounts.activeCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow" 
        onClick={() => setActiveTab('completed')}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${activeTab === 'completed' ? 'bg-primary' : 'bg-muted'}`}>
              <CheckCircle className={`h-5 w-5 ${activeTab === 'completed' ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pedidos Atendidos</p>
              <p className={`text-2xl font-bold ${activeTab === 'completed' ? 'text-primary' : 'text-foreground'}`}>
                {statusCounts.completedCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow" 
        onClick={() => setActiveTab('cancelled')}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${activeTab === 'cancelled' ? 'bg-primary' : 'bg-muted'}`}>
              <XCircle className={`h-5 w-5 ${activeTab === 'cancelled' ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pedidos Cancelados</p>
              <p className={`text-2xl font-bold ${activeTab === 'cancelled' ? 'text-primary' : 'text-foreground'}`}>
                {statusCounts.cancelledCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Total de Pedidos</p>
              <p className="text-2xl font-bold">{statusCounts.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
