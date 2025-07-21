
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory, ProductStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

export interface ProductWithUnit extends Product {
  unitOfMeasure: string;
}

export function useProducts() {
  const [products, setProducts] = useState<ProductWithUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Função para calcular status do produto (memoizada)
  const calculateProductStatus = useCallback((item: any): ProductStatus => {
    const expirationDate = new Date(item.expiration_date);
    const today = new Date();
    const timeDiff = expirationDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return ProductStatus.EXPIRED;
    } else if (item.current_quantity === 0) {
      return ProductStatus.OUT_OF_STOCK;
    } else if (item.current_quantity <= item.minimum_quantity) {
      return ProductStatus.LOW_STOCK;
    } else {
      return ProductStatus.ACTIVE;
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    console.log('Fetching products from Supabase...');

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log('Raw products data:', data);

      // Transformar os dados do Supabase para o formato esperado
      const transformedProducts: ProductWithUnit[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        category: item.category as ProductCategory,
        description: item.description,
        batch: item.batch,
        expirationDate: new Date(item.expiration_date),
        minimumQuantity: item.minimum_quantity,
        currentQuantity: item.current_quantity,
        location: item.location,
        supplier: item.supplier,
        status: calculateProductStatus(item),
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        unitOfMeasure: item.unit_of_measure || 'unid.',
      }));

      console.log('Transformed products:', transformedProducts);
      setProducts(transformedProducts);
    } catch (error: any) {
      console.error('Error in fetchProducts:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar produtos",
        description: error.message || "Não foi possível carregar a lista de produtos.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [calculateProductStatus, toast]);

  const deleteProduct = async (id: string) => {
    console.log('Deleting product:', id);

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }

      toast({
        title: "Produto excluído",
        description: "O produto foi removido com sucesso.",
      });

      // Atualizar a lista local
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error: any) {
      console.error('Error in deleteProduct:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir produto",
        description: error.message || "Não foi possível excluir o produto.",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateProduct = async (id: string, updates: Partial<ProductWithUnit>) => {
    console.log('Updating product:', id, updates);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          category: updates.category,
          description: updates.description || null,
          batch: updates.batch,
          expiration_date: updates.expirationDate?.toISOString(),
          minimum_quantity: updates.minimumQuantity,
          current_quantity: updates.currentQuantity,
          location: updates.location || null,
          supplier: updates.supplier || null,
          unit_of_measure: updates.unitOfMeasure || 'unid.',
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }

      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso.",
      });

      // Atualizar a lista local
      await fetchProducts();
    } catch (error: any) {
      console.error('Error in updateProduct:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar produto",
        description: error.message || "Não foi possível atualizar o produto.",
      });
    }
  };

  return {
    products,
    isLoading,
    refetch: fetchProducts,
    deleteProduct,
    updateProduct,
  };
}
