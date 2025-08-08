import { Product } from './index';

/**
 * Estende o tipo Product com informações adicionais específicas da UI
 */
export interface ProductWithUnit extends Product {
  /**
   * Unidade de medida do produto (ex: un, kg, l, etc)
   */
  unitOfMeasure: string;
}

/**
 * Dados necessários para criar um novo produto
 */
export interface CreateProductData {
  name: string;
  category: string;
  description?: string;
  batch: string;
  expirationDate: Date;
  minimumQuantity: number;
  currentQuantity: number;
  location?: string;
  supplier?: string;
  unitOfMeasure: string;
}

/**
 * Dados necessários para atualizar um produto existente
 */
export type UpdateProductData = Partial<CreateProductData>;
