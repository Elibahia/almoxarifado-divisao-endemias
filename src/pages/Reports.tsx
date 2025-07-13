import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  BarChart3
} from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

export default function Reports() {
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
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="medications">Medicamentos</SelectItem>
                  <SelectItem value="supplies">Materiais Médicos</SelectItem>
                  <SelectItem value="endemic">Controle Endemia</SelectItem>
                  <SelectItem value="lab">Laboratório</SelectItem>
                  <SelectItem value="ppe">EPIs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="stock-status">Status</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="low">Estoque Baixo</SelectItem>
                  <SelectItem value="expired">Vencido</SelectItem>
                  <SelectItem value="out">Esgotado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
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
              <DatePickerWithRange />
            </div>
            <div>
              <Label htmlFor="movement-type">Tipo de Movimentação</Label>
              <Select>
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
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os usuários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os usuários</SelectItem>
                  <SelectItem value="ana">Ana Silva</SelectItem>
                  <SelectItem value="carlos">Carlos Santos</SelectItem>
                  <SelectItem value="maria">Maria Oliveira</SelectItem>
                  <SelectItem value="joao">João Costa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
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
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Próximos 30 dias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Próximos 7 dias</SelectItem>
                  <SelectItem value="15">Próximos 15 dias</SelectItem>
                  <SelectItem value="30">Próximos 30 dias</SelectItem>
                  <SelectItem value="60">Próximos 60 dias</SelectItem>
                  <SelectItem value="expired">Já vencidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expiration-category">Categoria</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="medications">Medicamentos</SelectItem>
                  <SelectItem value="supplies">Materiais Médicos</SelectItem>
                  <SelectItem value="endemic">Controle Endemia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
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
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <TableIcon className="h-6 w-6" />
              <span className="text-sm">Estoque Completo</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Vencimentos</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">Movimentações Mensais</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Filter className="h-6 w-6" />
              <span className="text-sm">Estoque Baixo</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Relatório de Estoque - Medicamentos', date: '13/07/2024 14:30', user: 'Ana Silva', type: 'PDF' },
              { name: 'Movimentações - Julho 2024', date: '12/07/2024 16:15', user: 'Carlos Santos', type: 'Excel' },
              { name: 'Produtos Vencendo - 30 dias', date: '11/07/2024 09:20', user: 'Maria Oliveira', type: 'PDF' },
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium text-sm">{report.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      Gerado por {report.user} em {report.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-muted px-2 py-1 rounded">{report.type}</span>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}