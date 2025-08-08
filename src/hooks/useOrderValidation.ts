import { OrderFormData, OrderProduct } from '@/types/orderTypes';

export function useOrderValidation() {
  const validateOrderForm = (data: OrderFormData): { success: boolean; errors?: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    if (!data.requesterName || data.requesterName.trim().length === 0) {
      errors.requesterName = 'Nome do solicitante é obrigatório';
    }
    
    if (!data.subdistrict || data.subdistrict.trim().length === 0) {
      errors.subdistrict = 'Subdistrito é obrigatório';
    }
    
    if (!data.products || data.products.length === 0) {
      errors.products = 'Pelo menos um produto deve ser adicionado';
    } else {
      data.products.forEach((product, index) => {
        if (!product.productId) {
          if (!errors.products) errors.products = {};
          errors.products[index] = { productId: { message: 'Produto é obrigatório' } };
        }
        if (!product.quantity || (typeof product.quantity === 'number' && product.quantity < 1)) {
          if (!errors.products) errors.products = {};
          if (!errors.products[index]) errors.products[index] = {};
          errors.products[index].quantity = { message: 'Quantidade deve ser maior que zero' };
        }
      });
    }
    
    return Object.keys(errors).length === 0 ? { success: true } : { success: false, errors };
  };

  const validateProduct = (product: OrderProduct): { success: boolean; errors?: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    if (!product.productId) {
      errors.productId = 'Produto é obrigatório';
    }
    
    if (!product.quantity || (typeof product.quantity === 'number' && product.quantity < 1)) {
      errors.quantity = 'Quantidade deve ser maior que zero';
    }
    
    return Object.keys(errors).length === 0 ? { success: true } : { success: false, errors };
  };

  return {
    validateOrderForm,
    validateProduct,
  };
}
