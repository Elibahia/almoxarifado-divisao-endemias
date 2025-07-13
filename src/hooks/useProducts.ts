
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory, ProductStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
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
      const transformedProducts: Product[] = (data || []).map(item => {
        const expirationDate = new Date(item.expiration_date);
        const createdAt = new Date(item.created_at);
        const updatedAt = new Date(item.updated_at);

        // Determinar o status baseado na lógica de negócio
        let status: ProductStatus = ProductStatus.ACTIVE;
        
        const today = new Date();
        const timeDiff = expirationDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysDiff < 0) {
          status = ProductStatus.EXPIRED;
        } else if (item.current_quantity === 0) {
          status = ProductStatus.OUT_OF_STOCK;
        } else if (item.current_quantity <= item.minimum_quantity) {
          status = ProductStatus.LOW_STOCK;
        } else {
          status = ProductStatus.ACTIVE;
        }

        return {
          id: item.id,
          name: item.name,
          category: item.category as ProductCategory,
          description: item.description,
          batch: item.batch,
          expirationDate,
          minimumQuantity: item.minimum_quantity,
          currentQuantity: item.current_quantity,
          location: item.location,
          supplier: item.supplier,
          status,
          createdAt,
          updatedAt,
        };
      });

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
  };

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
  }, []);

  return {
    products,
    isLoading,
    refetch: fetchProducts,
    deleteProduct,
  };
}
