
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Calendar, 
  Package, 
  TrendingDown,
  CheckCheck,
  Clock,
  Bell
} from "lucide-react";
import { useAlerts } from "@/hooks/useAlerts";

export default function Alerts() {
  const { alerts, loading, markAsRead, markAllAsRead } = useAlerts();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'expired':
        return <Calendar className="h-4 w-4" />;
      case 'expiring_soon':
        return <Clock className="h-4 w-4" />;
      case 'low_stock':
        return <TrendingDown className="h-4 w-4" />;
      case 'out_of_stock':
        return <Package className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const unreadAlerts = alerts.filter(alert => !alert.is_read);
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const highAlerts = alerts.filter(alert => alert.severity === 'high');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando alertas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Alertas</h1>
          <p className="text-muted-foreground">
            Monitoramento de alertas do sistema de almoxarifado
          </p>
        </div>
        {unreadAlerts.length > 0 && (
          <Button onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Marcar Todos como Lido
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Alertas</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Não Lidos</p>
                <p className="text-2xl font-bold">{unreadAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold">{criticalAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Alta Prioridade</p>
                <p className="text-2xl font-bold">{highAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Nenhum alerta encontrado</h3>
              <p className="text-muted-foreground">
                Não há alertas ativos no momento.
              </p>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`transition-all ${
                alert.is_read ? 'opacity-60' : 'border-l-4 border-l-primary'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getTypeIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity === 'critical' && 'Crítico'}
                          {alert.severity === 'high' && 'Alto'}
                          {alert.severity === 'medium' && 'Médio'}
                          {alert.severity === 'low' && 'Baixo'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(alert.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="font-medium mb-1">{alert.message}</p>
                      {alert.products && (
                        <p className="text-sm text-muted-foreground">
                          Produto: {alert.products.name} - {alert.products.category}
                        </p>
                      )}
                    </div>
                  </div>
                  {!alert.is_read && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsRead(alert.id)}
                    >
                      Marcar como Lido
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
