import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Calendar,
  Package,
  TrendingDown,
  CheckCircle,
  Bell,
  Eye,
  X
} from "lucide-react";
import { AlertType, AlertSeverity } from '@/types';

// Mock data
const alerts = [
  {
    id: '1',
    type: AlertType.EXPIRING_SOON,
    productName: 'Paracetamol 500mg',
    message: 'Produto vence em 5 dias',
    severity: AlertSeverity.HIGH,
    isRead: false,
    createdAt: new Date('2024-07-13T08:00:00'),
    daysLeft: 5,
    quantity: 450
  },
  {
    id: '2',
    type: AlertType.LOW_STOCK,
    productName: 'Seringas Descartáveis 10ml',
    message: 'Estoque abaixo do mínimo (25/50)',
    severity: AlertSeverity.MEDIUM,
    isRead: false,
    createdAt: new Date('2024-07-13T07:30:00'),
    currentQuantity: 25,
    minimumQuantity: 50
  },
  {
    id: '3',
    type: AlertType.EXPIRED,
    productName: 'Álcool 70% - 1L',
    message: 'Produto vencido há 3 dias',
    severity: AlertSeverity.CRITICAL,
    isRead: true,
    createdAt: new Date('2024-07-10T12:00:00'),
    daysExpired: 3,
    quantity: 8
  },
  {
    id: '4',
    type: AlertType.OUT_OF_STOCK,
    productName: 'Luvas de Procedimento (M)',
    message: 'Produto esgotado',
    severity: AlertSeverity.HIGH,
    isRead: false,
    createdAt: new Date('2024-07-12T15:45:00'),
    quantity: 0
  },
  {
    id: '5',
    type: AlertType.EXPIRING_SOON,
    productName: 'Dipirona 500mg',
    message: 'Produto vence em 15 dias',
    severity: AlertSeverity.MEDIUM,
    isRead: true,
    createdAt: new Date('2024-07-11T10:15:00'),
    daysLeft: 15,
    quantity: 120
  }
];

export default function Alerts() {
  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const criticalCount = alerts.filter(alert => alert.severity === AlertSeverity.CRITICAL).length;
  const highCount = alerts.filter(alert => alert.severity === AlertSeverity.HIGH).length;

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case AlertType.EXPIRING_SOON:
        return <Calendar className="h-5 w-5 text-warning" />;
      case AlertType.LOW_STOCK:
        return <TrendingDown className="h-5 w-5 text-error" />;
      case AlertType.EXPIRED:
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case AlertType.OUT_OF_STOCK:
        return <Package className="h-5 w-5 text-destructive" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return <Badge variant="destructive" className="bg-red-600">Crítico</Badge>;
      case AlertSeverity.HIGH:
        return <Badge variant="destructive">Alto</Badge>;
      case AlertSeverity.MEDIUM:
        return <Badge variant="destructive" className="bg-warning text-warning-foreground">Médio</Badge>;
      case AlertSeverity.LOW:
        return <Badge variant="secondary">Baixo</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getTypeLabel = (type: AlertType) => {
    switch (type) {
      case AlertType.EXPIRING_SOON:
        return 'Vencimento Próximo';
      case AlertType.LOW_STOCK:
        return 'Estoque Baixo';
      case AlertType.EXPIRED:
        return 'Produto Vencido';
      case AlertType.OUT_OF_STOCK:
        return 'Esgotado';
      default:
        return 'Outros';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `há ${days} dia${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `há ${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      return 'agora';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Alertas</h1>
          <p className="text-muted-foreground">
            Centro de notificações e alertas do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar Todos como Lidos
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Configurar Alertas
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Alertas
            </CardTitle>
            <Bell className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{alerts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Alertas ativos</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Não Lidos
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{unreadCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Requerem atenção</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Críticos
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Ação imediata</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alta Prioridade
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error">{highCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Prioritários</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Lista de Alertas ({alerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`flex items-start gap-4 p-4 rounded-lg border transition-all hover:shadow-sm ${
                  alert.isRead 
                    ? 'bg-card border-border opacity-80' 
                    : 'bg-card border-l-4 border-l-primary shadow-sm'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getAlertIcon(alert.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{alert.productName}</h3>
                        {!alert.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {getTypeLabel(alert.type)}
                      </p>
                      <p className="text-sm text-foreground mb-3">
                        {alert.message}
                      </p>
                      
                      {/* Additional Information */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatTimeAgo(alert.createdAt)}</span>
                        {alert.daysLeft && (
                          <span>• Vence em {alert.daysLeft} dias</span>
                        )}
                        {alert.daysExpired && (
                          <span>• Vencido há {alert.daysExpired} dias</span>
                        )}
                        {alert.currentQuantity !== undefined && (
                          <span>• Estoque: {alert.currentQuantity}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      {getSeverityBadge(alert.severity)}
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {alerts.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum alerta ativo
              </h3>
              <p className="text-muted-foreground">
                Todos os produtos estão dentro dos parâmetros normais.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}