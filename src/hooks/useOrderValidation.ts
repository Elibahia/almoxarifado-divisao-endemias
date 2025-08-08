import { OrderFormData, OrderProduct } from '@/types/orderTypes';

export function useOrderValidation() {
  const validateOrderForm = (data: OrderFormData): { success: boolean; errors?: any } => {
    const errors: any = {};
    
    if (!data.requesterName || data.requesterName.trim().length === 0) {
      errors.requesterName = 'Nome do solicitante é obrigatório';
    }
    
    if (!data.subdistrict || data.subdistrict.trim().length === 0) {
      errors.subdistrict = 'Subdistrito é obrigatório';
    }
    
    if (!data.products || data.products.length === 0) {
      errors.products = 'Pelo menos um produto deve ser adicionado';
    } else {
      const productErrors: any = {};
      let hasProductErrors = false;
      
      data.products.forEach((product, index) => {
        const productError: any = {};
        
        if (!product.productId) {
          productError.productId = 'Produto é obrigatório';
        }
        
        if (!product.quantity || (typeof product.quantity === 'number' && product.quantity < 1)) {
          productError.quantity = 'Quantidade deve ser maior que zero';
        }
        
        if (Object.keys(productError).length > 0) {
          productErrors[index] = productError;
          hasProductErrors = true;
        }
      });
      
      if (hasProductErrors) {
        errors.products = productErrors;
      }
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
