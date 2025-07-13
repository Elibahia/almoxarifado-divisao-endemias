import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Package,
  AlertTriangle,
  Calendar,
  Filter
} from "lucide-react";
import { ProductCategory, ProductStatus } from '@/types';

// Mock data
const products = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    category: ProductCategory.MEDICATIONS,
    batch: 'L2024001',
    expirationDate: new Date('2024-12-15'),
    currentQuantity: 450,
    minimumQuantity: 100,
    status: ProductStatus.ACTIVE,
    location: 'Prateleira A1',
    supplier: 'Farmácia Central'
  },
  {
    id: '2',
    name: 'Seringas Descartáveis 10ml',
    category: ProductCategory.MEDICAL_SUPPLIES,
    batch: 'S2024015',
    expirationDate: new Date('2025-06-20'),
    currentQuantity: 25,
    minimumQuantity: 50,
    status: ProductStatus.LOW_STOCK,
    location: 'Armário B2',
    supplier: 'Medicus Ltda'
  },
  {
    id: '3',
    name: 'Álcool 70% - 1L',
    category: ProductCategory.MEDICAL_SUPPLIES,
    batch: 'A2024008',
    expirationDate: new Date('2024-08-10'),
    currentQuantity: 8,
    minimumQuantity: 20,
    status: ProductStatus.EXPIRED,
    location: 'Prateleira C3',
    supplier: 'Química Medicinal'
  },
  {
    id: '4',
    name: 'Inseticida para Dengue',
    category: ProductCategory.ENDEMIC_CONTROL,
    batch: 'D2024003',
    expirationDate: new Date('2025-03-15'),
    currentQuantity: 120,
    minimumQuantity: 30,
    status: ProductStatus.ACTIVE,
    location: 'Depósito D1',
    supplier: 'Control Tech'
  },
  {
    id: '5',
    name: 'Luvas de Procedimento (M)',
    category: ProductCategory.PERSONAL_PROTECTIVE_EQUIPMENT,
    batch: 'P2024012',
    expirationDate: new Date('2026-01-30'),
    currentQuantity: 0,
    minimumQuantity: 100,
    status: ProductStatus.OUT_OF_STOCK,
    location: 'Armário E1',
    supplier: 'SafeGuard Med'
  }
];

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.batch.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.ACTIVE:
        return <Badge variant="outline" className="text-success border-success">Ativo</Badge>;
      case ProductStatus.LOW_STOCK:
        return <Badge variant="destructive" className="bg-warning text-warning-foreground">Estoque Baixo</Badge>;
      case ProductStatus.EXPIRED:
        return <Badge variant="destructive">Vencido</Badge>;
      case ProductStatus.OUT_OF_STOCK:
        return <Badge variant="destructive">Esgotado</Badge>;
      default:
        return <Badge variant="secondary">Inativo</Badge>;
    }
  };

  const getCategoryLabel = (category: ProductCategory) => {
    const labels = {
      [ProductCategory.MEDICATIONS]: 'Medicamentos',
      [ProductCategory.MEDICAL_SUPPLIES]: 'Materiais Médicos',
      [ProductCategory.ENDEMIC_CONTROL]: 'Controle Endemia',
      [ProductCategory.LABORATORY]: 'Laboratório',
      [ProductCategory.PERSONAL_PROTECTIVE_EQUIPMENT]: 'EPIs',
      [ProductCategory.OTHER]: 'Outros'
    };
    return labels[category] || category;
  };

  const getExpirationWarning = (date: Date) => {
    const today = new Date();
    const timeDiff = date.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) {
      return { type: 'expired', days: Math.abs(daysDiff), color: 'text-error' };
    } else if (daysDiff <= 30) {
      return { type: 'expiring', days: daysDiff, color: 'text-warning' };
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie o catálogo de produtos do almoxarifado
          </p>
        </div>
        <Button variant="medical" className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou lote..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value={ProductCategory.MEDICATIONS}>Medicamentos</SelectItem>
                <SelectItem value={ProductCategory.MEDICAL_SUPPLIES}>Materiais Médicos</SelectItem>
                <SelectItem value={ProductCategory.ENDEMIC_CONTROL}>Controle Endemia</SelectItem>
                <SelectItem value={ProductCategory.LABORATORY}>Laboratório</SelectItem>
                <SelectItem value={ProductCategory.PERSONAL_PROTECTIVE_EQUIPMENT}>EPIs</SelectItem>
                <SelectItem value={ProductCategory.OTHER}>Outros</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value={ProductStatus.ACTIVE}>Ativo</SelectItem>
                <SelectItem value={ProductStatus.LOW_STOCK}>Estoque Baixo</SelectItem>
                <SelectItem value={ProductStatus.EXPIRED}>Vencido</SelectItem>
                <SelectItem value={ProductStatus.OUT_OF_STOCK}>Esgotado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lista de Produtos ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Produto</TableHead>
                  <TableHead className="font-semibold">Categoria</TableHead>
                  <TableHead className="font-semibold">Lote</TableHead>
                  <TableHead className="font-semibold">Validade</TableHead>
                  <TableHead className="font-semibold">Estoque</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const expirationWarning = getExpirationWarning(product.expirationDate);
                  return (
                    <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(product.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {product.batch}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={expirationWarning?.color || ''}>
                            {product.expirationDate.toLocaleDateString('pt-BR')}
                          </span>
                          {expirationWarning && (
                            <div className="flex items-center gap-1">
                              {expirationWarning.type === 'expired' ? (
                                <AlertTriangle className="h-4 w-4 text-error" />
                              ) : (
                                <Calendar className="h-4 w-4 text-warning" />
                              )}
                              <span className={`text-xs ${expirationWarning.color}`}>
                                {expirationWarning.type === 'expired' 
                                  ? `Vencido há ${expirationWarning.days} dias`
                                  : `${expirationWarning.days} dias`
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className={
                            product.currentQuantity <= product.minimumQuantity 
                              ? 'text-error font-medium' 
                              : 'text-foreground'
                          }>
                            {product.currentQuantity}
                          </span>
                          <span className="text-muted-foreground"> / mín: {product.minimumQuantity}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(product.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-error hover:text-error">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou adicione um novo produto.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}