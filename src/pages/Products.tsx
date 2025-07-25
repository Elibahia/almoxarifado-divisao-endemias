
import { useState, useMemo, useCallback } from 'react';
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Package,
  AlertTriangle,
  Calendar,
  Filter,
  Loader2
} from "lucide-react";
import { Product, ProductCategory, ProductStatus } from '@/types';
import { useProducts, ProductWithUnit } from '@/hooks/useProducts';
import { getUnitLabel } from '@/types/unitTypes';
import { ProductForm } from '@/components/ProductForm';

export default function Products() {
  const { products, isLoading, refetch, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showProductForm, setShowProductForm] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductWithUnit | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Memoização dos produtos filtrados para melhor performance
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.batch.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, selectedCategory, selectedStatus]);

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
      [ProductCategory.GRAPHIC_MATERIALS]: 'Materiais Gráficos',
      [ProductCategory.CLEANING_MATERIALS]: 'Materiais de Limpeza',
      [ProductCategory.UNIFORMS]: 'Fardamentos',
      [ProductCategory.OFFICE_SUPPLIES]: 'Material de Escritório',
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

  // Callbacks otimizados para melhor performance
  const handleProductFormSuccess = useCallback(() => {
    setShowProductForm(false);
    setProductToEdit(null);
    refetch();
  }, [refetch]);

  const handleEditProduct = useCallback((product: ProductWithUnit) => {
    setProductToEdit(product);
    setShowProductForm(true);
  }, []);

  const handleNewProduct = useCallback(() => {
    setProductToEdit(null);
    setShowProductForm(true);
  }, []);

  const handleDeleteProduct = useCallback(async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete);
      setProductToDelete(null);
    }
  }, [productToDelete, deleteProduct]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando produtos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Produtos</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie o catálogo de produtos do almoxarifado
          </p>
        </div>
        <Button
          variant="medical"
          className="gap-2 w-full sm:w-auto"
          onClick={handleNewProduct}
        >
          <Plus className="h-4 w-4" />
          <span className="sm:hidden">Novo</span>
          <span className="hidden sm:inline">Novo Produto</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
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
                <SelectItem value={ProductCategory.GRAPHIC_MATERIALS}>Materiais Gráficos</SelectItem>
                <SelectItem value={ProductCategory.CLEANING_MATERIALS}>Materiais de Limpeza</SelectItem>
                <SelectItem value={ProductCategory.UNIFORMS}>Fardamentos</SelectItem>
                <SelectItem value={ProductCategory.OFFICE_SUPPLIES}>Material de Escritório</SelectItem>
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
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lista de Produtos ({filteredProducts.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                // Exportar para CSV
                const headers = ['Nome', 'Categoria', 'Lote', 'Validade', 'Estoque', 'Mínimo', 'Status'];
                const csvContent = [
                  headers.join(','),
                  ...filteredProducts.map(product => [
                    `"${product.name}"`,
                    `"${getCategoryLabel(product.category)}"`,
                    `"${product.batch}"`,
                    `"${product.expirationDate.toLocaleDateString('pt-BR')}"`,
                    product.currentQuantity,
                    product.minimumQuantity,
                    `"${product.status}"`
                  ].join(','))
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `produtos-${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-md border overflow-hidden">
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
                            {product.location || 'Localização não definida'}
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
                          <span className="text-muted-foreground"> {getUnitLabel(product.unitOfMeasure)}</span>
                          <div className="text-xs text-muted-foreground">
                            mín: {product.minimumQuantity} {getUnitLabel(product.unitOfMeasure)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(product.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-error hover:text-error"
                            onClick={() => setProductToDelete(product.id)}
                          >
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

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredProducts.map((product) => {
              const expirationWarning = getExpirationWarning(product.expirationDate);
              return (
                <Card key={product.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {product.location || 'Localização não definida'}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-error hover:text-error"
                        onClick={() => setProductToDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Categoria:</span>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(product.category)}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <div className="mt-1">
                        {getStatusBadge(product.status)}
                      </div>
                    </div>

                    <div>
                      <span className="text-muted-foreground">Lote:</span>
                      <div className="font-mono text-sm mt-1">{product.batch}</div>
                    </div>

                    <div>
                      <span className="text-muted-foreground">Estoque:</span>
                      <div className="mt-1">
                        <span className={
                          product.currentQuantity <= product.minimumQuantity
                            ? 'text-error font-medium'
                            : 'text-foreground'
                        }>
                          {product.currentQuantity}
                        </span>
                        <span className="text-muted-foreground"> {getUnitLabel(product.unitOfMeasure)}</span>
                        <div className="text-xs text-muted-foreground">
                          mín: {product.minimumQuantity} {getUnitLabel(product.unitOfMeasure)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <span className="text-muted-foreground text-sm">Validade:</span>
                    <div className="flex items-center gap-2 mt-1">
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
                  </div>
                </Card>
              );
            })}
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

      {/* Product Form Sheet */}
      <Sheet open={showProductForm} onOpenChange={setShowProductForm}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-4 sm:p-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-lg sm:text-xl">
              {productToEdit ? 'Editar Produto' : 'Novo Produto'}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-2">
            <ProductForm
              product={productToEdit}
              onSuccess={handleProductFormSuccess}
              onCancel={() => {
                setShowProductForm(false);
                setProductToEdit(null);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent aria-describedby="delete-product-description">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription id="delete-product-description">
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
