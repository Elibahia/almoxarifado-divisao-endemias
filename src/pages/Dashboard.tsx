import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Calendar,
  ArrowUpDown,
  Plus,
  Eye
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// Mock data - in real app this would come from API
const dashboardStats = {
  totalProducts: 342,
  activeAlerts: 8,
  lowStockProducts: 15,
  expiringProducts: 12,
  todayMovements: 23,
};

const monthlyMovements = [
  { month: 'Jan', entradas: 120, saidas: 98 },
  { month: 'Fev', entradas: 135, saidas: 112 },
  { month: 'Mar', entradas: 148, saidas: 125 },
  { month: 'Abr', entradas: 162, saidas: 140 },
  { month: 'Mai', entradas: 175, saidas: 155 },
  { month: 'Jun', entradas: 189, saidas: 167 },
];

const recentAlerts = [
  { id: '1', product: 'Paracetamol 500mg', type: 'Vencimento próximo', severity: 'high', daysLeft: 5 },
  { id: '2', product: 'Seringas 10ml', type: 'Estoque baixo', severity: 'medium', quantity: 8 },
  { id: '3', product: 'Álcool 70%', type: 'Estoque baixo', severity: 'high', quantity: 3 },
  { id: '4', product: 'Dipirona 500mg', type: 'Vencimento próximo', severity: 'medium', daysLeft: 15 },
];

const recentMovements = [
  { id: '1', product: 'Ibuprofeno 600mg', type: 'Saída', quantity: 50, user: 'Ana Silva', time: '10:30' },
  { id: '2', product: 'Luvas de Procedimento', type: 'Entrada', quantity: 200, user: 'Carlos Santos', time: '09:15' },
  { id: '3', product: 'Antisséptico', type: 'Saída', quantity: 25, user: 'Maria Oliveira', time: '08:45' },
];

export default function Dashboard() {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de almoxarifado
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Relatório
          </Button>
          <Button variant="success" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Movimentação
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{dashboardStats.totalProducts}</div>
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
            <div className="text-2xl font-bold text-warning">{dashboardStats.activeAlerts}</div>
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
            <div className="text-2xl font-bold text-error">{dashboardStats.lowStockProducts}</div>
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
            <div className="text-2xl font-bold text-warning">{dashboardStats.expiringProducts}</div>
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
            <div className="text-2xl font-bold text-primary">{dashboardStats.todayMovements}</div>
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
              <Button variant="ghost" size="sm">Ver todos</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{alert.product}</h4>
                    <p className="text-xs text-muted-foreground">{alert.type}</p>
                    {alert.daysLeft && (
                      <p className="text-xs text-warning">
                        Vence em {alert.daysLeft} dias
                      </p>
                    )}
                    {alert.quantity && (
                      <p className="text-xs text-error">
                        Apenas {alert.quantity} unidades
                      </p>
                    )}
                  </div>
                  <Badge variant={getSeverityColor(alert.severity) as any}>
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
            <Button variant="ghost" size="sm">Ver todas</Button>
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