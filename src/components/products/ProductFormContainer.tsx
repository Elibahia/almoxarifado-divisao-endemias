import { useCallback } from 'react';
import { useProductContainer } from '@/hooks/useProductContainer';
import { ProductFormPresentational, ProductFormData } from './ProductFormPresentational';
import { Product } from '@/types';
import { CreateProductData, UpdateProductData } from '@/services/productService';

interface ProductFormContainerProps {
  product?: (Product & { unitOfMeasure?: string }) | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductFormContainer({ product, onSuccess, onCancel }: ProductFormContainerProps) {
  const { 
    createProduct, 
    updateProduct, 
    isCreating, 
    isUpdating, 
    createError, 
    updateError 
  } = useProductContainer();

  const handleSubmit = useCallback(async (data: ProductFormData) => {
    try {
      if (product) {
        // Update existing product
        const updateData: UpdateProductData = {
          id: product.id,
          ...data
        };
        await updateProduct(updateData);
      } else {
        // Create new product
        const createData: CreateProductData = {
          ...data
        };
        await createProduct(createData);
      }
      
      onSuccess();
    } catch (error) {
      // Error handling is done in the container hook
      console.error('Product form submission error:', error);
    }
  }, [product, createProduct, updateProduct, onSuccess]);

  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;

  return (
    <ProductFormPresentational
      product={product}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      error={error}
    />
  );
}
