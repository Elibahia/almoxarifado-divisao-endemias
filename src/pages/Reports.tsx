
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileBarChart, 
  Download, 
  Calendar,
  Filter,
  FileText,
  Table as TableIcon,
  BarChart3,
  Loader2
} from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useReports, ReportFilters } from "@/hooks/useReports";
import { useProducts } from "@/hooks/useProducts";
import { useMovements } from "@/hooks/useMovements";
import { ProductCategory } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Reports() {
  const { products } = useProducts();
  const { movements } = useMovements();
  const { 
    generateStockReport, 
    generateMovementReport, 
    generateExpirationReport,
    exportToPDF,
    exportToExcel,
    isGenerating 
  } = useReports();

  const [stockFilters, setStockFilters] = useState<ReportFilters>({});
  const [movementFilters, setMovementFilters] = useState<ReportFilters>({});
  const [expirationFilters, setExpirationFilters] = useState<ReportFilters>({ expirationDays: 30 });

  const [currentReport, setCurrentReport] = useState<{
    type: string;
    data: any[];
  } | null>(null);

  // Estatísticas gerais
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.currentQuantity <= p.minimumQuantity).length;
  const expiredProducts = products.filter(p => p.expirationDate < new Date()).length;
  const todayMovements = movements.filter(m => {
    const today = new Date();
    const movementDate = new Date(m.timestamp);
    return movementDate.toDateString() === today.toDateString();
  }).length;

  const handleGenerateStockReport = () => {
    const data = generateStockReport(stockFilters);
    setCurrentReport({ type: 'Estoque', data });
  };

  const handleGenerateMovementReport = () => {
    const data = generateMovementReport(movementFilters);  
    setCurrentReport({ type: 'Movimentações', data });
  };

  const handleGenerateExpirationReport = () => {
    const data = generateExpirationReport(expirationFilters);
    setCurrentReport({ type: 'Validade', data });
  };

  const uniqueUsers = Array.from(new Set(movements.map(m => m.responsibleUser)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">
            Geração de relatórios e análises do almoxarifado
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TableIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Produtos</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                <p className="text-2xl font-bold">{lowStockProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Produtos Vencidos</p>
                <p className="text-2xl font-bold">{expiredProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Movimentações Hoje</p>
                <p className="text-2xl font-bold">{todayMovements}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stock Report */}
        <Card className="hover:shadow-card transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TableIcon className="h-5 w-5 text-primary" />
              Relatório de Estoque
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Situação atual do estoque com alertas e quantidades
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="stock-category">Categoria</Label>
              <Select onValueChange={(value) => setStockFilters(prev => ({ ...prev, category: value as ProductCategory }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="graphic_materials">Materiais Gráficos</SelectItem>
                  <SelectItem value="cleaning_materials">Materiais de Limpeza</SelectItem>
                  <SelectItem value="uniforms">Fardamentos</SelectItem>
                  <SelectItem value="office_supplies">Material de Escritório</SelectItem>
                  <SelectItem value="endemic_control">Controle Endemia</SelectItem>
                  <SelectItem value="laboratory">Laboratório</SelectItem>
                  <SelectItem value="ppe">EPIs</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="stock-status">Status</Label>
              <Select onValueChange={(value) => setStockFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="low_stock">Estoque Baixo</SelectItem>
                  <SelectItem value="expired">Vencido</SelectItem>
                  <SelectItem value="out_of_stock">Esgotado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateStockReport} className="w-full mb-2">
              <FileBarChart className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => currentReport?.type === 'Estoque' && exportToPDF(currentReport.data, 'Estoque', stockFilters)}
                disabled={!currentReport || currentReport.type !== 'Estoque' || isGenerating}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                PDF
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => currentReport?.type === 'Estoque' && exportToExcel(currentReport.data, 'Estoque', stockFilters)}
                disabled={!currentReport || currentReport.type !== 'Estoque' || isGenerating}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Movement Report */}
        <Card className="hover:shadow-card transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-success" />
              Relatório de Movimentações
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Histórico de entradas, saídas e transferências
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Período</Label>
              <DatePickerWithRange 
                onDateChange={(dateRange) => setMovementFilters(prev => ({ ...prev, dateRange }))}
              />
            </div>
            <div>
              <Label htmlFor="movement-type">Tipo de Movimentação</Label>
              <Select onValueChange={(value) => setMovementFilters(prev => ({ ...prev, movementType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="entry">Entradas</SelectItem>
                  <SelectItem value="exit">Saídas</SelectItem>
                  <SelectItem value="adjustment">Ajustes</SelectItem>
                  <SelectItem value="transfer">Transferências</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="responsible">Responsável</Label>
              <Select onValueChange={(value) => setMovementFilters(prev => ({ ...prev, responsibleUser: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os usuários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os usuários</SelectItem>
                  {uniqueUsers.map(user => (
                    <SelectItem key={user} value={user}>{user}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateMovementReport} className="w-full mb-2">
              <FileBarChart className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => currentReport?.type === 'Movimentações' && exportToPDF(currentReport.data, 'Movimentações', movementFilters)}
                disabled={!currentReport || currentReport.type !== 'Movimentações' || isGenerating}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                PDF
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => currentReport?.type === 'Movimentações' && exportToExcel(currentReport.data, 'Movimentações', movementFilters)}
                disabled={!currentReport || currentReport.type !== 'Movimentações' || isGenerating}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Expiration Report */}
        <Card className="hover:shadow-card transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-warning" />
              Relatório de Validade
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Produtos próximos ao vencimento ou vencidos
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="expiration-filter">Filtro de Validade</Label>
              <Select onValueChange={(value) => setExpirationFilters(prev => ({ ...prev, expirationDays: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Próximos 30 dias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Próximos 7 dias</SelectItem>
                  <SelectItem value="15">Próximos 15 dias</SelectItem>
                  <SelectItem value="30">Próximos 30 dias</SelectItem>
                  <SelectItem value="60">Próximos 60 dias</SelectItem>
                  <SelectItem value="-1">Já vencidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expiration-category">Categoria</Label>
              <Select onValueChange={(value) => setExpirationFilters(prev => ({ ...prev, category: value as ProductCategory }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="graphic_materials">Materiais Gráficos</SelectItem>
                  <SelectItem value="cleaning_materials">Materiais de Limpeza</SelectItem>
                  <SelectItem value="uniforms">Fardamentos</SelectItem>
                  <SelectItem value="office_supplies">Material de Escritório</SelectItem>
                  <SelectItem value="endemic_control">Controle Endemia</SelectItem>
                  <SelectItem value="laboratory">Laboratório</SelectItem>
                  <SelectItem value="ppe">EPIs</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateExpirationReport} className="w-full mb-2">
              <FileBarChart className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => currentReport?.type === 'Validade' && exportToPDF(currentReport.data, 'Validade', expirationFilters)}
                disabled={!currentReport || currentReport.type !== 'Validade' || isGenerating}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                PDF
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => currentReport?.type === 'Validade' && exportToExcel(currentReport.data, 'Validade', expirationFilters)}
                disabled={!currentReport || currentReport.type !== 'Validade' || isGenerating}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5" />
            Relatórios Rápidos
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Acesso rápido aos relatórios mais utilizados
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => {
                setStockFilters({});
                handleGenerateStockReport();
              }}
            >
              <TableIcon className="h-6 w-6" />
              <span className="text-sm">Estoque Completo</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => {
                setExpirationFilters({ expirationDays: 30 });
                handleGenerateExpirationReport();
              }}
            >
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Vencimentos</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => {
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                setMovementFilters({ dateRange: { from: firstDay, to: lastDay } });
                handleGenerateMovementReport();
              }}
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">Movimentações Mensais</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => {
                setStockFilters({ status: 'low_stock' });
                handleGenerateStockReport();
              }}
            >
              <Filter className="h-6 w-6" />
              <span className="text-sm">Estoque Baixo</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {currentReport && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado do Relatório - {currentReport.type}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {currentReport.data.length} registro(s) encontrado(s)
            </p>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {currentReport.data.length > 0 && Object.keys(currentReport.data[0]).map((key) => (
                      <TableHead key={key} className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentReport.data.map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, cellIndex) => (
                        <TableCell key={cellIndex}>
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
