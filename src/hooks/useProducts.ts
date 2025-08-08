import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory, ProductStatus } from '@/types';
import { ProductWithUnit, CreateProductData, UpdateProductData } from '@/types/products';
import { useToast } from '@/hooks/use-toast';

export function useProducts() {
  const [products, setProducts] = useState<ProductWithUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Função para calcular status do produto (memoizada)
  type DbProduct = {
    expiration_date?: string | null
    current_quantity?: number | null
    minimum_quantity?: number | null
  }
  const calculateProductStatus = useCallback((item: DbProduct): ProductStatus => {
    const expirationDate = new Date(item.expiration_date);
    const today = new Date();
    const timeDiff = expirationDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return ProductStatus.EXPIRED;
    } else if ((item.current_quantity ?? 0) === 0) {
      return ProductStatus.OUT_OF_STOCK;
    } else if ((item.current_quantity ?? 0) <= (item.minimum_quantity ?? 0)) {
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
    } catch (error: unknown) {
      console.error('Error in fetchProducts:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar produtos",
        description: (error instanceof Error) ? error.message : "Não foi possível carregar a lista de produtos.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [calculateProductStatus, toast]);

  const deleteProduct = useCallback(async (id: string) => {
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
    } catch (error: unknown) {
      console.error('Error in deleteProduct:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir produto",
        description: (error instanceof Error) ? error.message : "Não foi possível excluir o produto.",
      });
      throw error; // Re-throw para que o componente possa lidar com o erro, se necessário
    }
  }, [toast]);

  const createProduct = useCallback(async (productData: CreateProductData) => {
    console.log('Creating product:', productData);

    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          category: productData.category,
          description: productData.description || null,
          batch: productData.batch,
          expiration_date: productData.expirationDate?.toISOString(),
          minimum_quantity: productData.minimumQuantity,
          current_quantity: productData.currentQuantity,
          location: productData.location || null,
          supplier: productData.supplier || null,
          unit_of_measure: productData.unitOfMeasure || 'unid.',
        });

      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }

      toast({
        title: "Produto criado",
        description: "O produto foi criado com sucesso.",
      });

      // Atualizar a lista local
      await fetchProducts();
    } catch (error: unknown) {
      console.error('Error in createProduct:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar produto",
        description: (error instanceof Error) ? error.message : "Não foi possível criar o produto.",
      });
    }
  }, [fetchProducts, toast]);

  const updateProduct = useCallback(async (id: string, productData: UpdateProductData) => {
    console.log('Updating product:', id, productData);

    try {
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      // Apenas adiciona os campos que foram fornecidos no productData
      if (productData.name !== undefined) updateData.name = productData.name;
      if (productData.category !== undefined) updateData.category = productData.category;
      if (productData.description !== undefined) updateData.description = productData.description || null;
      if (productData.batch !== undefined) updateData.batch = productData.batch;
      if (productData.expirationDate !== undefined) updateData.expiration_date = productData.expirationDate?.toISOString();
      if (productData.minimumQuantity !== undefined) updateData.minimum_quantity = productData.minimumQuantity;
      if (productData.currentQuantity !== undefined) updateData.current_quantity = productData.currentQuantity;
      if (productData.location !== undefined) updateData.location = productData.location || null;
      if (productData.supplier !== undefined) updateData.supplier = productData.supplier || null;
      if (productData.unitOfMeasure !== undefined) updateData.unit_of_measure = productData.unitOfMeasure || 'unid.';

      const { error } = await supabase
        .from('products')
        .update(updateData)
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
    } catch (error: unknown) {
      console.error('Error in updateProduct:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar produto",
        description: (error instanceof Error) ? error.message : "Não foi possível atualizar o produto.",
      });
    }
  }, [fetchProducts, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Memoize o valor de retorno para evitar recriação desnecessária
  return useMemo(() => ({
    products,
    isLoading,
    refetch: fetchProducts,
    deleteProduct,
    createProduct,
    updateProduct,
  }), [products, isLoading, fetchProducts, deleteProduct, createProduct, updateProduct]);
}
