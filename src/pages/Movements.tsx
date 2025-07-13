import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowUpDown, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  RotateCcw,
  ArrowRightLeft,
  Calendar,
  User,
  FileText
} from "lucide-react";
import { MovementType } from '@/types';

// Mock data
const movements = [
  {
    id: '1',
    productName: 'Paracetamol 500mg',
    type: MovementType.EXIT,
    quantity: 50,
    reason: 'Dispensação para UBS Centro',
    responsibleUser: 'Ana Silva',
    timestamp: new Date('2024-07-13T10:30:00'),
    notes: 'Solicitação via sistema interno',
    batch: 'L2024001'
  },
  {
    id: '2',
    productName: 'Seringas Descartáveis 10ml',
    type: MovementType.ENTRY,
    quantity: 200,
    reason: 'Compra - NF 12345',
    responsibleUser: 'Carlos Santos',
    timestamp: new Date('2024-07-13T09:15:00'),
    notes: 'Entrega do fornecedor Medicus Ltda',
    invoiceNumber: 'NF-12345'
  },
  {
    id: '3',
    productName: 'Álcool 70% - 1L',
    type: MovementType.EXIT,
    quantity: 25,
    reason: 'Distribuição para agentes de saúde',
    responsibleUser: 'Maria Oliveira',
    timestamp: new Date('2024-07-13T08:45:00'),
    notes: 'Campanha de vacinação',
    batch: 'A2024008'
  },
  {
    id: '4',
    productName: 'Luvas de Procedimento (M)',
    type: MovementType.ADJUSTMENT,
    quantity: -10,
    reason: 'Ajuste por avaria',
    responsibleUser: 'João Costa',
    timestamp: new Date('2024-07-12T16:20:00'),
    notes: 'Produtos danificados durante transporte'
  },
  {
    id: '5',
    productName: 'Inseticida para Dengue',
    type: MovementType.TRANSFER,
    quantity: 30,
    reason: 'Transferência para UBS Norte',
    responsibleUser: 'Paula Ferreira',
    timestamp: new Date('2024-07-12T14:00:00'),
    notes: 'Demanda urgente para controle de foco'
  }
];

export default function Movements() {
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredMovements = movements.filter(movement => {
    return selectedType === 'all' || movement.type === selectedType;
  });

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
        return <ArrowUpDown className="h-4 w-4" />;
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

  const getQuantityDisplay = (type: MovementType, quantity: number) => {
    const sign = type === MovementType.ENTRY ? '+' : 
                type === MovementType.EXIT ? '-' : 
                quantity > 0 ? '+' : '';
    
    const color = type === MovementType.ENTRY ? 'text-success' :
                 type === MovementType.EXIT ? 'text-error' :
                 quantity > 0 ? 'text-success' : 'text-error';
    
    return (
      <span className={`font-medium ${color}`}>
        {sign}{Math.abs(quantity)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Movimentações</h1>
          <p className="text-muted-foreground">
            Histórico de entradas, saídas e ajustes de estoque
          </p>
        </div>
        <Button variant="medical" className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Movimentação
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-card transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Entradas Hoje
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">+200</div>
            <p className="text-xs text-muted-foreground mt-1">1 movimentação</p>
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
            <div className="text-2xl font-bold text-error">-75</div>
            <p className="text-xs text-muted-foreground mt-1">2 movimentações</p>
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
            <div className="text-2xl font-bold text-warning">-10</div>
            <p className="text-xs text-muted-foreground mt-1">1 ajuste</p>
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
            <div className="text-2xl font-bold text-primary">30</div>
            <p className="text-xs text-muted-foreground mt-1">1 transferência</p>
          </CardContent>
        </Card>
      </div>

      {/* Movements Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Histórico de Movimentações ({filteredMovements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Data/Hora</TableHead>
                  <TableHead className="font-semibold">Produto</TableHead>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold">Quantidade</TableHead>
                  <TableHead className="font-semibold">Motivo</TableHead>
                  <TableHead className="font-semibold">Responsável</TableHead>
                  <TableHead className="font-semibold">Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((movement) => (
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
                      <div className="flex items-center gap-2">
                        {getMovementIcon(movement.type)}
                        {getMovementBadge(movement.type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        {getQuantityDisplay(movement.type, movement.quantity)}
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

          {filteredMovements.length === 0 && (
            <div className="text-center py-8">
              <ArrowUpDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhuma movimentação encontrada
              </h3>
              <p className="text-muted-foreground">
                Registre uma nova movimentação para começar.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}