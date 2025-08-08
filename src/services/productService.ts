import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory } from '@/types';
import { ProductWithUnit } from '@/hooks/useProducts';
import { ErrorFactory, isAppError } from '@/types/errors';
import { ErrorService } from './errorService';

export interface CreateProductData {
  name: string;
  category: ProductCategory;
  description?: string;
  batch: string;
  expirationDate: string;
  minimumQuantity: number;
  currentQuantity: number;
  location?: string;
  supplier?: string;
  unitOfMeasure: string;
}

export interface UpdateProductData extends CreateProductData {
  id: string;
}

// Re-exportar tipos de erro para compatibilidade
import type { AppError, ValidationError, ApiError, NetworkError } from '@/types/errors';

export type ProductServiceError = AppError & {
  service: 'product';
  operation: string;
};

export class ProductService {
  /**
   * Cria um novo produto no banco de dados
   * @throws {ValidationError} Quando os dados do produto são inválidos
   * @throws {ApiError} Quando ocorre um erro na API
   * @throws {NetworkError} Quando há problemas de conexão
   */
  static async createProduct(data: CreateProductData): Promise<ProductWithUnit> {
    try {
      // Validação básica
      if (!data.name || !data.batch || !data.expirationDate) {
        throw ErrorFactory.createValidationError(
          'Dados do produto inválidos',
          {
            name: data.name ? [] : ['O nome do produto é obrigatório'],
            batch: data.batch ? [] : ['O lote do produto é obrigatório'],
            expirationDate: data.expirationDate ? [] : ['A data de validade é obrigatória']
          },
          'PRODUCT_VALIDATION_ERROR'
        );
      }

      const { data: product, error } = await supabase
        .from('products')
        .insert([{
          name: data.name,
          category: data.category,
          description: data.description || null,
          batch: data.batch,
          expiration_date: data.expirationDate,
          minimum_quantity: data.minimumQuantity,
          current_quantity: data.currentQuantity,
          location: data.location || null,
          supplier: data.supplier || null,
          unit_of_measure: data.unitOfMeasure,
        }])
        .select()
        .single();

      if (error) {
        // Tratamento específico para erros de restrição única
        if (error.code === '23505') {
          const detail = error.details?.toLowerCase() || '';
          let field = 'dados';
          
          if (detail.includes('name')) field = 'nome';
          else if (detail.includes('batch')) field = 'lote';
          
          throw ErrorFactory.createAppError(
            `Já existe um produto com este ${field}.`, 
            'DUPLICATE_PRODUCT',
            {
              severity: 'warning',
              isRecoverable: true,
              statusCode: 409,
            }
          );
        }
        
        // Lança um erro de API genérico para outros erros do Supabase
        throw ErrorFactory.createApiError(
          error.message,
          'products',
          'POST',
          { status: error.code, details: error.details },
          'PRODUCT_CREATION_ERROR'
        );
      }

      if (!product) {
        throw ErrorFactory.createAppError(
          'Nenhum dado retornado ao criar produto',
          'NO_DATA_RETURNED',
          { severity: 'error' }
        );
      }

      return this.transformProduct(product);
    } catch (error) {
      // Se já for um erro nosso, apenas propaga
      if (isAppError(error)) throw error;
      
      // Caso contrário, trata como um erro de rede
      throw ErrorFactory.createNetworkError(
        error,
        'Erro ao conectar ao servidor',
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Atualiza um produto existente
   * @throws {ValidationError} Quando os dados do produto são inválidos
   * @throws {NotFoundError} Quando o produto não é encontrado
   * @throws {ApiError} Quando ocorre um erro na API
   */
  static async updateProduct(data: UpdateProductData): Promise<ProductWithUnit> {
    try {
      if (!data.id) {
        throw ErrorFactory.createValidationError(
          'ID do produto não fornecido',
          { id: ['O ID do produto é obrigatório'] },
          'MISSING_PRODUCT_ID'
        );
      }

      const { data: product, error } = await supabase
        .from('products')
        .update({
          name: data.name,
          category: data.category,
          description: data.description || null,
          batch: data.batch,
          expiration_date: data.expirationDate,
          minimum_quantity: data.minimumQuantity,
          current_quantity: data.currentQuantity,
          location: data.location || null,
          supplier: data.supplier || null,
          unit_of_measure: data.unitOfMeasure,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Registro não encontrado
          throw ErrorFactory.createAppError(
            'Produto não encontrado',
            'PRODUCT_NOT_FOUND',
            {
              severity: 'warning',
              isRecoverable: false,
              statusCode: 404,
            }
          );
        }
        
        throw ErrorFactory.createApiError(
          error.message,
          `products/${data.id}`,
          'PATCH',
          { status: error.code },
          'PRODUCT_UPDATE_ERROR'
        );
      }

      if (!product) {
        throw ErrorFactory.createAppError(
          'Nenhum dado retornado ao atualizar produto',
          'NO_UPDATE_DATA_RETURNED',
          { severity: 'error' }
        );
      }

      return this.transformProduct(product);
    } catch (error) {
      if (isAppError(error)) throw error;
      
      throw ErrorFactory.createNetworkError(
        error,
        'Erro ao conectar ao servidor',
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Exclui um produto
   * @throws {NotFoundError} Quando o produto não é encontrado
   * @throws {ApiError} Quando ocorre um erro na API
   */
  static async deleteProduct(id: string): Promise<void> {
    try {
      if (!id) {
        throw ErrorFactory.createValidationError(
          'ID do produto não fornecido',
          { id: ['O ID do produto é obrigatório'] },
          'MISSING_PRODUCT_ID'
        );
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.code === 'PGRST116') { // Registro não encontrado
          throw ErrorFactory.createAppError(
            'Produto não encontrado',
            'PRODUCT_NOT_FOUND',
            {
              severity: 'warning',
              isRecoverable: false,
              statusCode: 404,
            }
          );
        }
        
        throw ErrorFactory.createApiError(
          error.message,
          `products/${id}`,
          'DELETE',
          { status: error.code },
          'PRODUCT_DELETE_ERROR'
        );
      }
    } catch (error) {
      if (isAppError(error)) throw error;
      
      throw ErrorFactory.createNetworkError(
        error,
        'Erro ao conectar ao servidor',
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Obtém todos os produtos
   * @throws {ApiError} Quando ocorre um erro na API
   */
  static async getProducts(): Promise<ProductWithUnit[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw ErrorFactory.createApiError(
          error.message,
          'products',
          'GET',
          { status: error.code },
          'PRODUCTS_FETCH_ERROR'
        );
      }

      return (data || []).map(this.transformProduct);
    } catch (error) {
      if (isAppError(error)) throw error;
      
      throw ErrorFactory.createNetworkError(
        error,
        'Erro ao buscar produtos',
        'PRODUCTS_FETCH_ERROR'
      );
    }
  }

  /**
   * Obtém um produto pelo ID
   * @throws {NotFoundError} Quando o produto não é encontrado
   * @throws {ApiError} Quando ocorre um erro na API
   */
  static async getProduct(id: string): Promise<ProductWithUnit> {
    try {
      if (!id) {
        throw ErrorFactory.createValidationError(
          'ID do produto não fornecido',
          { id: ['O ID do produto é obrigatório'] },
          'MISSING_PRODUCT_ID'
        );
      }

      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Registro não encontrado
          throw ErrorFactory.createAppError(
            'Produto não encontrado',
            'PRODUCT_NOT_FOUND',
            {
              severity: 'warning',
              isRecoverable: false,
              statusCode: 404,
            }
          );
        }
        
        throw ErrorFactory.createApiError(
          error.message,
          `products/${id}`,
          'GET',
          { status: error.code },
          'PRODUCT_FETCH_ERROR'
        );
      }

      if (!product) {
        throw ErrorFactory.createAppError(
          'Produto não encontrado',
          'PRODUCT_NOT_FOUND',
          {
            severity: 'warning',
            isRecoverable: false,
            statusCode: 404,
          }
        );
      }

      return this.transformProduct(product);
    } catch (error) {
      if (isAppError(error)) throw error;
      
      throw ErrorFactory.createNetworkError(
        error,
        'Erro ao buscar produto',
        'PRODUCT_FETCH_ERROR'
      );
    }
  }

  /**
   * Transforma um produto do formato do banco de dados para o formato da aplicação
   * @throws {Error} Quando os dados do produto são inválidos
   */
  private static transformProduct(dbProduct: any): ProductWithUnit {
    try {
      if (!dbProduct) {
        throw ErrorFactory.createAppError(
          'Dados do produto inválidos',
          'INVALID_PRODUCT_DATA',
          { severity: 'error' }
        );
      }

      // Validação básica dos campos obrigatórios
      const requiredFields = ['id', 'name', 'batch', 'expiration_date'];
      const missingFields = requiredFields.filter(field => !dbProduct[field]);
      
      if (missingFields.length > 0) {
        throw ErrorFactory.createValidationError(
          'Dados do produto incompletos',
          Object.fromEntries(missingFields.map(field => [field, ['Campo obrigatório']])),
          'INVALID_PRODUCT_DATA'
        );
      }

      return {
        id: dbProduct.id,
        name: dbProduct.name,
        category: dbProduct.category as ProductCategory,
        description: dbProduct.description,
        batch: dbProduct.batch,
        expirationDate: new Date(dbProduct.expiration_date),
        minimumQuantity: dbProduct.minimum_quantity,
        currentQuantity: dbProduct.current_quantity,
        location: dbProduct.location,
        supplier: dbProduct.supplier,
        status: this.calculateProductStatus(dbProduct),
        createdAt: new Date(dbProduct.created_at),
        updatedAt: new Date(dbProduct.updated_at || dbProduct.created_at),
        unitOfMeasure: dbProduct.unit_of_measure || 'unid.',
      };
    } catch (error) {
      // Log do erro para debug
      console.error('Erro ao transformar produto:', error);
      
      // Se já for um erro nosso, apenas propaga
      if (isAppError(error)) throw error;
      
      // Caso contrário, encapsula em um erro de aplicação
      throw ErrorFactory.createAppError(
        'Erro ao processar os dados do produto',
        'PRODUCT_TRANSFORM_ERROR',
        {
          severity: 'error',
          details: error,
          originalData: dbProduct,
        }
      );
    }
  }

  /**
   * Calcula o status do produto com base na data de validade e quantidade em estoque
   */
  private static calculateProductStatus(product: any): string {
    try {
      if (!product) return 'unknown';
      
      // Verifica se a data de validade é válida
      const expirationDate = new Date(product.expiration_date);
      if (isNaN(expirationDate.getTime())) {
        console.warn('Data de validade inválida para o produto:', product.id);
        return 'unknown';
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normaliza para o início do dia
      
      const timeDiff = expirationDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      // Define a quantidade atual e mínima, tratando valores nulos/undefined
      const currentQty = Number(product.current_quantity) || 0;
      const minQty = Number(product.minimum_quantity) || 0;
      
      // Lógica de status
      if (currentQty <= 0) {
        return 'out_of_stock';
      } else if (daysDiff < 0) {
        return 'expired';
      } else if (daysDiff <= 30) { // Produtos que vencem em até 30 dias
        return 'expiring_soon';
      } else if (currentQty <= minQty) {
        return 'low_stock';
      } else {
        return 'active';
      }
    } catch (error) {
      console.error('Erro ao calcular status do produto:', error, product);
      return 'unknown';
    }
  }

  /**
   * @deprecated Use ErrorFactory em vez disso
   */
  private static handleError(error: any, defaultMessage: string): never {
    console.warn('Método handleError está obsoleto. Use ErrorFactory em vez disso.');
    
    if (isAppError(error)) {
      throw error;
    }
    
    throw ErrorFactory.createAppError(
      error?.message || defaultMessage,
      error?.code || 'PRODUCT_SERVICE_ERROR',
      {
        severity: 'error',
        details: error,
        isRecoverable: true,
      }
    );
  }
}
