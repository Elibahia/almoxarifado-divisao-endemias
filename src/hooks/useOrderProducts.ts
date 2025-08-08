import { useState, useCallback } from 'react';
import { OrderProduct } from '@/types/orderTypes';
import { Product } from '@/types';

interface UseOrderProductsProps {
  products: Product[];
  onProductsChange: (products: OrderProduct[]) => void;
}

export function useOrderProducts({ products, onProductsChange }: UseOrderProductsProps) {
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([
    { id: '1', productId: '', productName: '', quantity: 1, unitOfMeasure: 'unid.' }
  ]);

  const addProductRow = useCallback(() => {
    const newProduct: OrderProduct = {
      id: Date.now().toString(),
      productId: '',
      productName: '',
      quantity: 1,
      unitOfMeasure: 'unid.',
    };
    const updatedProducts = [...orderProducts, newProduct];
    setOrderProducts(updatedProducts);
    onProductsChange(updatedProducts);
  }, [orderProducts, onProductsChange]);

  const removeProductRow = useCallback((id: string) => {
    if (orderProducts.length === 1) {
      return;
    }
    const updatedProducts = orderProducts.filter(p => p.id !== id);
    setOrderProducts(updatedProducts);
    onProductsChange(updatedProducts);
  }, [orderProducts, onProductsChange]);

  const updateProduct = useCallback((id: string, field: keyof OrderProduct, value: string | number) => {
    const updatedProducts = orderProducts.map(p => {
      if (p.id === id) {
        const updatedProduct = { ...p, [field]: value };
        if (field === 'productId' && typeof value === 'string') {
          const selectedProduct = products.find(prod => prod.id === value);
          if (selectedProduct) {
            updatedProduct.productName = selectedProduct.name;
            updatedProduct.unitOfMeasure = selectedProduct.unitOfMeasure || 'unid.';
          }
        }
        return updatedProduct;
      }
      return p;
    });
    setOrderProducts(updatedProducts);
    onProductsChange(updatedProducts);
  }, [orderProducts, products, onProductsChange]);

  const resetProducts = useCallback(() => {
    const defaultProducts = [
      { id: '1', productId: '', productName: '', quantity: 1, unitOfMeasure: 'unid.' }
    ];
    setOrderProducts(defaultProducts);
    onProductsChange(defaultProducts);
  }, [onProductsChange]);

  return {
    orderProducts,
    addProductRow,
    removeProductRow,
    updateProduct,
    resetProducts,
  };
}
