import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ProductService, CreateProductData, UpdateProductData } from '@/services/productService';
import { ProductWithUnit } from '@/hooks/useProducts';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

export function useProductContainer() {
  const [products, setProducts] = useState<ProductWithUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch products operation
  const fetchProductsOperation = useAsyncOperation(
    () => ProductService.getProducts(),
    {
      maxRetries: 3,
      onSuccess: (data) => {
        setProducts(data);
        setIsLoading(false);
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Erro ao carregar produtos",
          description: error.message,
        });
        setIsLoading(false);
      }
    }
  );

  // Create product operation
  const createProductOperation = useAsyncOperation(
    (data: CreateProductData) => ProductService.createProduct(data),
    {
      maxRetries: 2,
      onSuccess: (newProduct) => {
        setProducts(prev => [newProduct, ...prev]);
        toast({
          title: "Produto criado com sucesso!",
          description: `${newProduct.name} foi adicionado ao estoque.`,
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Erro ao criar produto",
          description: error.message,
        });
      }
    }
  );

  // Update product operation
  const updateProductOperation = useAsyncOperation(
    (data: UpdateProductData) => ProductService.updateProduct(data),
    {
      maxRetries: 2,
      onSuccess: (updatedProduct) => {
        setProducts(prev => 
          prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
        );
        toast({
          title: "Produto atualizado com sucesso!",
          description: `${updatedProduct.name} foi atualizado.`,
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar produto",
          description: error.message,
        });
      }
    }
  );

  // Delete product operation
  const deleteProductOperation = useAsyncOperation(
    (id: string) => ProductService.deleteProduct(id),
    {
      maxRetries: 2,
      onSuccess: (_, productId) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
        toast({
          title: "Produto excluído",
          description: "O produto foi removido com sucesso.",
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Erro ao excluir produto",
          description: error.message,
        });
      }
    }
  );

  // Initialize products
  const initializeProducts = useCallback(() => {
    setIsLoading(true);
    fetchProductsOperation.execute();
  }, [fetchProductsOperation]);

  // Create product
  const createProduct = useCallback(async (data: CreateProductData) => {
    return await createProductOperation.execute(data);
  }, [createProductOperation]);

  // Update product
  const updateProduct = useCallback(async (data: UpdateProductData) => {
    return await updateProductOperation.execute(data);
  }, [updateProductOperation]);

  // Delete product
  const deleteProduct = useCallback(async (id: string) => {
    return await deleteProductOperation.execute(id);
  }, [deleteProductOperation]);

  // Refresh products
  const refreshProducts = useCallback(() => {
    initializeProducts();
  }, [initializeProducts]);

  return {
    // State
    products,
    isLoading,
    
    // Operations
    createProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    initializeProducts,
    
    // Operation states
    isCreating: createProductOperation.loading,
    isUpdating: updateProductOperation.loading,
    isDeleting: deleteProductOperation.loading,
    isFetching: fetchProductsOperation.loading,
    
    // Errors
    createError: createProductOperation.error,
    updateError: updateProductOperation.error,
    deleteError: deleteProductOperation.error,
    fetchError: fetchProductsOperation.error,
  };
}
