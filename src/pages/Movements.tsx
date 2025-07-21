
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  TrendingUp, 
  TrendingDown,
  RotateCcw,
  ArrowRightLeft,
  Calendar,
  User,
  FileText,
  Package
} from "lucide-react";
import { MovementType } from '@/types';
import { useMovements } from '@/hooks/useMovements';
import MovementForm from '@/components/MovementForm';

export default function Movements() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { movements, isLoading, refetch } = useMovements();

  // Filtrar movimentações por tipo
  const entries = movements.filter(m => m.type === MovementType.ENTRY);
  const exits = movements.filter(m => m.type === MovementType.EXIT);
  const adjustments = movements.filter(m => m.type === MovementType.ADJUSTMENT);
  const transfers = movements.filter(m => m.type === MovementType.TRANSFER);

  // Calcular estatísticas do dia atual
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayMovements = movements.filter(m => {
    const movementDate = new Date(m.timestamp);
    movementDate.setHours(0, 0, 0, 0);
    return movementDate.getTime() === today.getTime();
  });

  const todayEntries = todayMovements.filter(m => m.type === MovementType.ENTRY);
  const todayExits = todayMovements.filter(m => m.type === MovementType.EXIT);
  const todayAdjustments = todayMovements.filter(m => m.type === MovementType.ADJUSTMENT);
  const todayTransfers = todayMovements.filter(m => m.type === MovementType.TRANSFER);

  const totalEntriesQty = todayEntries.reduce((sum, m) => sum + m.quantity, 0);
  const totalExitsQty = todayExits.reduce((sum, m) => sum + m.quantity, 0);
  const totalAdjustmentsQty = todayAdjustments.reduce((sum, m) => sum + m.quantity, 0);
  const totalTransfersQty = todayTransfers.reduce((sum, m) => sum + m.quantity, 0);

  const getMovementIcon = (type: MovementType) => {
    switch (type) {
      case MovementType.ENTRY:
        return <TrendingUp className="h-4 w-4 text-success" />;
      case MovementType.EXIT:
        return <TrendingDown className="h-4 w-4 text-error" />;
      case MovementType.ADJUSTMENT:
        return <RotateCcw className="h-4 w-4 text-warning" />;
      case MovementType.TRANSFER:
        return <ArrowRightLeft className="h-4 w-4 text-primary" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getMovementBadge = (type: MovementType) => {
    switch (type) {
      case MovementType.ENTRY:
        return <Badge variant="outline" className="text-success border-success">Entrada</Badge>;
      case MovementType.EXIT:
        return <Badge variant="destructive">Saída</Badge>;
      case MovementType.ADJUSTMENT:
        return <Badge variant="destructive" className="bg-warning text-warning-foreground">Ajuste</Badge>;
      case MovementType.TRANSFER:
        return <Badge variant="outline" className="text-primary border-primary">Transferência</Badge>;
      default:
        return <Badge variant="secondary">Outros</Badge>;
    }
  };

  const renderMovementTable = (movementsList: typeof movements, emptyMessage: string) => (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Data/Hora</TableHead>
              <TableHead className="font-semibold">Produto</TableHead>
              <TableHead className="font-semibold">Quantidade</TableHead>
              <TableHead className="font-semibold">Motivo</TableHead>
              <TableHead className="font-semibold">Responsável</TableHead>
              <TableHead className="font-semibold">Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movementsList.map((movement) => (
              <TableRow key={movement.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">
                        {movement.timestamp.toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {movement.timestamp.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{movement.productName}</div>
                    {movement.batch && (
                      <div className="text-xs text-muted-foreground font-mono">
                        Lote: {movement.batch}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-center">
                    <span className="font-medium text-foreground">
                      {movement.quantity}
                    </span>
                    <div className="text-xs text-muted-foreground">unidades</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <div className="font-medium text-sm">{movement.reason}</div>
                    {movement.invoiceNumber && (
                      <div className="text-xs text-muted-foreground">
                        {movement.invoiceNumber}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{movement.responsibleUser}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {movement.notes && (
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground max-w-xs truncate">
                        {movement.notes}
                      </span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {movementsList.map((movement) => (
          <Card key={movement.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getMovementIcon(movement.type)}
                <div>
                  <h3 className="font-medium text-foreground">{movement.productName}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{movement.timestamp.toLocaleDateString('pt-BR')}</span>
                    <span>{movement.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                {getMovementBadge(movement.type)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Quantidade:</span>
                <div className="font-medium mt-1">{movement.quantity} unidades</div>
              </div>
              
              <div>
                <span className="text-muted-foreground">Responsável:</span>
                <div className="flex items-center gap-1 mt-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{movement.responsibleUser}</span>
                </div>
              </div>
              
              {movement.batch && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Lote:</span>
                  <div className="font-mono text-sm mt-1">{movement.batch}</div>
                </div>
              )}
            </div>
            
            <div className="mt-3 pt-3 border-t">
              <div className="mb-2">
                <span className="text-muted-foreground text-sm">Motivo:</span>
                <div className="font-medium text-sm mt-1">{movement.reason}</div>
                {movement.invoiceNumber && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {movement.invoiceNumber}
                  </div>
                )}
              </div>
              
              {movement.notes && (
                <div>
                  <span className="text-muted-foreground text-sm">Observações:</span>
                  <div className="flex items-start gap-1 mt-1">
                    <FileText className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      {movement.notes}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {movementsList.length === 0 && (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {emptyMessage}
          </h3>
          <p className="text-muted-foreground">
            Registre uma nova movimentação para começar.
          </p>
        </div>
      )}
    </>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Movimentações</h1>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Movimentações</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Histórico de entradas, saídas e ajustes de estoque
          </p>
        </div>
        <Button 
          variant="medical" 
          className="gap-2 w-full sm:w-auto"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="sm:hidden">Nova</span>
          <span className="hidden sm:inline">Nova Movimentação</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Entradas Hoje
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">+{totalEntriesQty}</div>
            <p className="text-xs text-muted-foreground mt-1">{todayEntries.length} movimentação(ões)</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saídas Hoje
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error">-{totalExitsQty}</div>
            <p className="text-xs text-muted-foreground mt-1">{todayExits.length} movimentação(ões)</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ajustes
            </CardTitle>
            <RotateCcw className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{totalAdjustmentsQty}</div>
            <p className="text-xs text-muted-foreground mt-1">{todayAdjustments.length} ajuste(s)</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transferências
            </CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalTransfersQty}</div>
            <p className="text-xs text-muted-foreground mt-1">{todayTransfers.length} transferência(s)</p>
          </CardContent>
        </Card>
      </div>

      {/* Movements Tables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Histórico de Movimentações ({movements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            {/* Desktop Tabs */}
            <TabsList className="hidden md:grid w-full grid-cols-5">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="entries" className="text-success">
                Entradas ({entries.length})
              </TabsTrigger>
              <TabsTrigger value="exits" className="text-error">
                Saídas ({exits.length})
              </TabsTrigger>
              <TabsTrigger value="adjustments" className="text-warning">
                Ajustes ({adjustments.length})
              </TabsTrigger>
              <TabsTrigger value="transfers" className="text-primary">
                Transferências ({transfers.length})
              </TabsTrigger>
            </TabsList>
            
            {/* Mobile Tabs */}
            <div className="md:hidden">
              <TabsList className="grid w-full grid-cols-3 mb-2">
                <TabsTrigger value="all" className="text-xs">Todas</TabsTrigger>
                <TabsTrigger value="entries" className="text-success text-xs">
                  Entradas
                </TabsTrigger>
                <TabsTrigger value="exits" className="text-error text-xs">
                  Saídas
                </TabsTrigger>
              </TabsList>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="adjustments" className="text-warning text-xs">
                  Ajustes
                </TabsTrigger>
                <TabsTrigger value="transfers" className="text-primary text-xs">
                  Transferências
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-6">
              {renderMovementTable(movements, "Nenhuma movimentação encontrada")}
            </TabsContent>

            <TabsContent value="entries" className="mt-6">
              {renderMovementTable(entries, "Nenhuma entrada registrada")}
            </TabsContent>

            <TabsContent value="exits" className="mt-6">
              {renderMovementTable(exits, "Nenhuma saída registrada")}
            </TabsContent>

            <TabsContent value="adjustments" className="mt-6">
              {renderMovementTable(adjustments, "Nenhum ajuste registrado")}
            </TabsContent>

            <TabsContent value="transfers" className="mt-6">
              {renderMovementTable(transfers, "Nenhuma transferência registrada")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Movement Form Modal */}
      <MovementForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
}
