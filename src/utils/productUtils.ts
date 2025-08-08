import { ProductCategory } from '@/types';

export const getCategoryLabel = (category: ProductCategory): string => {
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

export const getExpirationWarning = (expirationDate: Date): { type: string; message: string } | null => {
  const today = new Date();
  const timeDiff = expirationDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  if (daysDiff < 0) {
    return {
      type: 'expired',
      message: `Expirado há ${Math.abs(daysDiff)} dia(s)`
    };
  } else if (daysDiff <= 30) {
    return {
      type: 'warning',
      message: `Expira em ${daysDiff} dia(s)`
    };
  } else if (daysDiff <= 90) {
    return {
      type: 'info',
      message: `Expira em ${daysDiff} dia(s)`
    };
  }

  return null;
};

export const isLowStock = (currentQuantity: number, minimumQuantity: number): boolean => {
  return currentQuantity <= minimumQuantity;
};

export const isOutOfStock = (currentQuantity: number): boolean => {
  return currentQuantity === 0;
};

export const isExpired = (expirationDate: Date): boolean => {
  const today = new Date();
  return expirationDate < today;
};

export const getStockStatus = (currentQuantity: number, minimumQuantity: number, expirationDate: Date): string => {
  if (isExpired(expirationDate)) {
    return 'expired';
  } else if (isOutOfStock(currentQuantity)) {
    return 'out_of_stock';
  } else if (isLowStock(currentQuantity, minimumQuantity)) {
    return 'low_stock';
  } else {
    return 'active';
  }
};

export const formatQuantity = (quantity: number, unitOfMeasure: string): string => {
  return `${quantity} ${unitOfMeasure}`;
};

export const getStockLevelColor = (currentQuantity: number, minimumQuantity: number): string => {
  if (currentQuantity === 0) {
    return 'text-destructive';
  } else if (currentQuantity <= minimumQuantity) {
    return 'text-warning';
  } else {
    return 'text-success';
  }
};
