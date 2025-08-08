import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useAlerts } from "@/hooks/useAlerts";
import { useMovements } from "@/hooks/useMovements";
import { MovementType } from "@/types";
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Calendar,
  ArrowUpDown,
  Plus,
  Eye,
  FileText
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { products = [] } = useProducts();
  const { alerts = [] } = useAlerts();
  const { movements = [] } = useMovements();

  // Calculate real dashboard stats
  const totalProducts = products.length;
  const activeAlerts = alerts.filter(alert => !alert.is_read).length;
  const lowStockProducts = products.filter(p => p.currentQuantity <= p.minimumQuantity && p.currentQuantity > 0).length;
  const expiringProducts = products.filter(p => {
    const expirationDate = new Date(p.expirationDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expirationDate <= thirtyDaysFromNow && expirationDate > new Date();
  }).length;
  
  const today = new Date().toDateString();
  const todayMovements = movements.filter(m => new Date(m.timestamp).toDateString() === today).length;

  // Get recent alerts (last 4)
  const recentAlerts = alerts
    .filter(alert => !alert.is_read)
    .slice(0, 4)
    .map(alert => ({
      id: alert.id,
      product: products.find(p => p.id === alert.product_id)?.name || 'Produto não encontrado',
      type: alert.type,
      severity: alert.severity,
      message: alert.message
    }));

  // Get recent movements (last 3)
  const recentMovements = movements
    .slice(0, 3)
    .map(movement => ({
      id: movement.id,
      product: movement.productName,
      type: movement.type === MovementType.ENTRY ? 'Entrada' : 'Saída',
      quantity: movement.quantity,
      user: movement.responsibleUser,
      time: new Date(movement.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }));

  // Monthly movements chart data
  const monthlyMovements = [
    { month: 'Jan', entradas: 0, saidas: 0 },
    { month: 'Fev', entradas: 0, saidas: 0 },
    { month: 'Mar', entradas: 0, saidas: 0 },
    { month: 'Abr', entradas: 0, saidas: 0 },
    { month: 'Mai', entradas: 0, saidas: 0 },
    { month: 'Jun', entradas: 0, saidas: 0 },
  ];

  // Calculate monthly movements from real data
  movements.forEach(movement => {
    const month = new Date(movement.timestamp).getMonth();
    if (month >= 0 && month < 6) {
      if (movement.type === MovementType.ENTRY) {
        monthlyMovements[month].entradas += movement.quantity;
      } else {
        monthlyMovements[month].saidas += movement.quantity;
      }
    }
  });
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getMovementIcon = (type: string) => {
    return type === 'Entrada' ? '↗' : '↙';
  };

  const getMovementColor = (type: string) => {
    return type === 'Entrada' ? 'text-success' : 'text-error';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Visão geral do sistema de almoxarifado
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/reports')}>
            <FileText className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Relatórios</span>
            <span className="sm:hidden">Relatórios</span>
          </Button>
          <Button variant="default" size="sm" onClick={() => navigate('/movements')}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nova Movimentação</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card className="hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Produtos ativos</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alertas Ativos
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{activeAlerts}</div>
            <p className="text-xs text-muted-foreground mt-1">Requerem atenção</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estoque Baixo
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Abaixo do mínimo</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vencimento Próximo
            </CardTitle>
            <Calendar className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{expiringProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Próximos 30 dias</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Movimentações Hoje
            </CardTitle>
            <ArrowUpDown className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{todayMovements}</div>
            <p className="text-xs text-muted-foreground mt-1">Entradas e saídas</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Movement Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5 text-primary" />
              Movimentações Mensais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyMovements}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="entradas" fill="hsl(var(--success))" name="Entradas" />
                <Bar dataKey="saidas" fill="hsl(var(--primary))" name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Alertas Recentes
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/alerts')}>Ver todos</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{alert.product}</h4>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                  </div>
                  <Badge variant={getSeverityColor(alert.severity) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                    {alert.severity === 'high' ? 'Alto' : alert.severity === 'medium' ? 'Médio' : 'Baixo'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Movements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5 text-primary" />
              Movimentações Recentes
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/movements')}>Ver todas</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentMovements.map((movement) => (
              <div key={movement.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`text-lg font-bold ${getMovementColor(movement.type)}`}>
                    {getMovementIcon(movement.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{movement.product}</h4>
                    <p className="text-xs text-muted-foreground">
                      {movement.type} • {movement.quantity} unidades • por {movement.user}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {movement.time}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}