import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useOrderRequests } from "@/hooks/useOrderRequests";
import { useAuth } from "@/hooks/useAuth";
import { 
  Package, 
  ShoppingCart,
  CheckSquare,
  Clock,
  CheckCircle,
  Truck,
  XCircle
} from "lucide-react";

export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const { orderRequests = [] } = useOrderRequests();
  const { userProfile } = useAuth();

  // Filter orders created by the current supervisor only
  const userOrders = orderRequests.filter(order => 
    order.createdBy === userProfile?.id
  );

  const getStatusCounts = () => {
    const counts = { pending: 0, approved: 0, delivered: 0, cancelled: 0, total: 0 };
    userOrders.forEach(order => {
      counts[order.status]++;
      counts.total++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard do Supervisor</h1>
          <p className="text-muted-foreground">
            Gerencie suas solicitações de pedidos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/order-management')}>
            <CheckSquare className="h-4 w-4 mr-2" />
            Meus Pedidos
          </Button>
          <Button variant="default" size="sm" onClick={() => navigate('/order-requests')}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Novo Pedido
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Pedidos
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{statusCounts.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Pedidos realizados</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aprovados
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statusCounts.approved}</div>
            <p className="text-xs text-muted-foreground mt-1">Prontos para entrega</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Entregues
            </CardTitle>
            <Truck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statusCounts.delivered}</div>
            <p className="text-xs text-muted-foreground mt-1">Pedidos concluídos</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cancelados
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statusCounts.cancelled}</div>
            <p className="text-xs text-muted-foreground mt-1">Pedidos cancelados</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-card transition-shadow cursor-pointer" onClick={() => navigate('/order-requests')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Solicitar Novo Pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Crie uma nova solicitação de pedido para seu subdistrito
            </p>
            <Button className="w-full">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Criar Pedido
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-shadow cursor-pointer" onClick={() => navigate('/order-management')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              Gerenciar Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Visualize o status dos seus pedidos solicitados
            </p>
            <Button variant="outline" className="w-full">
              <CheckSquare className="h-4 w-4 mr-2" />
              Ver Pedidos
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      {userOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Pedidos Recentes
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/order-management')}>
                Ver todos
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userOrders.slice(0, 5).map((order) => {
                const statusConfig = {
                  pending: { label: 'Pendente', color: 'bg-yellow-500', icon: Clock },
                  approved: { label: 'Aprovado', color: 'bg-blue-500', icon: CheckCircle },
                  delivered: { label: 'Entregue', color: 'bg-green-500', icon: Truck },
                  cancelled: { label: 'Cancelado', color: 'bg-red-500', icon: XCircle },
                }[order.status];
                
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <StatusIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium text-sm">{order.subdistrict}</h4>
                        <p className="text-xs text-muted-foreground">
                          {order.items.length} item(s) • {new Date(order.requestDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs text-white ${statusConfig.color}`}>
                      {statusConfig.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}