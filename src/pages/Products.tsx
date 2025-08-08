
import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Plus,
  Loader2
} from "lucide-react";
import { useProducts } from '@/hooks/useProducts';
import { ProductWithUnit } from '@/types/products';
import { useProductFilters } from '@/hooks/useProductFilters';
import { ProductFilters } from '@/components/products/ProductFilters';
import { VirtualizedProductTable } from '@/components/products/VirtualizedProductTable';
import { ProductForm } from '@/components/ProductForm';

export default function Products() {
  const { products, isLoading, refetch, deleteProduct } = useProducts();
  const [showProductForm, setShowProductForm] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductWithUnit | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    filteredProducts,
    getCategoryLabel,
    getStatusBadge,
    getExpirationWarning,
  } = useProductFilters({ products });

  const handleEditProduct = useCallback((product: ProductWithUnit) => {
    setProductToEdit(product);
    setShowProductForm(true);
  }, []);

  const handleDeleteProduct = useCallback((productId: string) => {
    setProductToDelete(productId);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete);
      setProductToDelete(null);
      refetch(); // Refresh the products list after deletion
    }
  }, [productToDelete, deleteProduct, refetch]);

  const handleFormSuccess = useCallback(() => {
    setShowProductForm(false);
    setProductToEdit(null);
    refetch();
  }, [refetch]);

  const handleFormCancel = useCallback(() => {
    setShowProductForm(false);
    setProductToEdit(null);
  }, []);

  // Mover callbacks para fora do JSX
  const handleAddProduct = useCallback(() => setShowProductForm(true), []);
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setShowProductForm(false);
      setProductToEdit(null);
    } else {
      setShowProductForm(true);
    }
  }, []);
  const handleDialogOpenChange = useCallback((open: boolean) => !open && setProductToDelete(null), []);

  const loadingState = useMemo(() => (
    <div className="flex items-center justify-center min-h-64">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ), []);

  if (isLoading) {
    return loadingState;
  }

  return (
    <div className="container mx-auto py-4 md:py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Produtos
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Gerencie o inventário de produtos do almoxarifado
            </p>
          </div>
          
          <Button 
            onClick={handleAddProduct}
            aria-label="Adicionar produto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Produto
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ProductFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
      />

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                Nenhum produto encontrado
              </div>
              <Button 
                onClick={handleAddProduct}
                aria-label="Adicionar primeiro produto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Produto
              </Button>
            </div>
          ) : (
            <VirtualizedProductTable
              products={filteredProducts}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              getCategoryLabel={getCategoryLabel}
              getExpirationWarning={getExpirationWarning}
              isDeletingId={productToDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Product Form Sheet */}
      <Sheet 
        open={showProductForm} 
        onOpenChange={handleOpenChange}
      >
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {productToEdit ? 'Editar Produto' : 'Adicionar Produto'}
            </SheetTitle>
          </SheetHeader>
          <ProductForm
            product={productToEdit}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!productToDelete} 
        onOpenChange={handleDialogOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir este produto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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
