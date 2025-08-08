/**
 * Tipos de erros personalizados para a aplicação
 */

export interface AppError extends Error {
  /**
   * Código de erro único para identificação
   */
  code: string;
  
  /**
   * Detalhes adicionais sobre o erro
   */
  details?: any;
  
  /**
   * Indica se o erro é recuperável
   */
  isRecoverable: boolean;
  
  /**
   * Nível de severidade do erro
   */
  severity: 'info' | 'warning' | 'error' | 'critical';
  
  /**
   * Código de status HTTP relacionado, se aplicável
   */
  statusCode?: number;
  
  /**
   * Timestamp de quando o erro ocorreu
   */
  timestamp: Date;
}

export interface ValidationError extends AppError {
  type: 'validation';
  fields: Record<string, string[]>;
}

export interface ApiError extends AppError {
  type: 'api';
  endpoint: string;
  method: string;
  response?: any;
}

export interface NetworkError extends AppError {
  type: 'network';
  isOffline: boolean;
  originalError: any;
}

export interface AuthError extends AppError {
  type: 'auth';
  isExpired: boolean;
  isUnauthenticated: boolean;
}

export interface NotFoundError extends AppError {
  type: 'not_found';
  resource: string;
  id?: string | number;
}

export interface PermissionError extends AppError {
  type: 'permission';
  requiredPermission: string;
  userId?: string;
}

export interface RateLimitError extends AppError {
  type: 'rate_limit';
  limit: number;
  remaining: number;
  resetTime: Date;
}

/**
 * Fábrica de erros personalizados
 */
export class ErrorFactory {
  static createAppError(
    message: string,
    code: string,
    options: Partial<Omit<AppError, 'message' | 'code' | 'name'>> = {}
  ): AppError {
    return {
      name: 'AppError',
      message,
      code,
      isRecoverable: true,
      severity: 'error',
      timestamp: new Date(),
      ...options
    };
  }

  static createValidationError(
    message: string,
    fields: Record<string, string[]>,
    code: string = 'VALIDATION_ERROR'
  ): ValidationError {
    return {
      ...this.createAppError(message, code, {
        severity: 'warning',
        isRecoverable: true,
      }),
      type: 'validation',
      fields,
    };
  }

  static createApiError(
    message: string,
    endpoint: string,
    method: string,
    response?: any,
    code: string = 'API_ERROR'
  ): ApiError {
    return {
      ...this.createAppError(message, code, {
        severity: 'error',
        isRecoverable: true,
        statusCode: response?.status,
      }),
      type: 'api',
      endpoint,
      method,
      response,
    };
  }

  static createNetworkError(
    error: any,
    message: string = 'Erro de conexão',
    code: string = 'NETWORK_ERROR'
  ): NetworkError {
    const isOffline = !navigator.onLine;
    
    return {
      ...this.createAppError(
        isOffline ? 'Você está offline. Verifique sua conexão.' : message,
        code,
        {
          severity: isOffline ? 'warning' : 'error',
          isRecoverable: true,
        }
      ),
      type: 'network',
      isOffline,
      originalError: error,
    };
  }

  static createAuthError(
    message: string,
    options: Partial<Omit<AuthError, 'message' | 'type' | keyof AppError>> = {},
    code: string = 'AUTH_ERROR'
  ): AuthError {
    return {
      ...this.createAppError(message, code, {
        severity: 'warning',
        isRecoverable: true,
        statusCode: 401,
      }),
      type: 'auth',
      isExpired: false,
      isUnauthenticated: true,
      ...options,
    };
  }

  static createNotFoundError(
    resource: string,
    id?: string | number,
    code: string = 'NOT_FOUND'
  ): NotFoundError {
    const message = id 
      ? `${resource} com ID ${id} não encontrado(a)`
      : `${resource} não encontrado(a)`;
    
    return {
      ...this.createAppError(message, code, {
        severity: 'warning',
        isRecoverable: true,
        statusCode: 404,
      }),
      type: 'not_found',
      resource,
      id,
    };
  }

  static createPermissionError(
    requiredPermission: string,
    userId?: string,
    message: string = 'Acesso não autorizado',
    code: string = 'PERMISSION_DENIED'
  ): PermissionError {
    return {
      ...this.createAppError(message, code, {
        severity: 'warning',
        isRecoverable: false,
        statusCode: 403,
      }),
      type: 'permission',
      requiredPermission,
      userId,
    };
  }

  static createRateLimitError(
    limit: number,
    remaining: number,
    resetTime: Date,
    message: string = 'Limite de requisições excedido',
    code: string = 'RATE_LIMIT_EXCEEDED'
  ): RateLimitError {
    return {
      ...this.createAppError(message, code, {
        severity: 'warning',
        isRecoverable: true,
        statusCode: 429,
      }),
      type: 'rate_limit',
      limit,
      remaining,
      resetTime,
    };
  }
}

/**
 * Verifica se um erro é do tipo AppError
 */
export function isAppError(error: any): error is AppError {
  return (
    error && 
    typeof error === 'object' && 
    'code' in error && 
    'isRecoverable' in error &&
    'severity' in error &&
    'timestamp' in error
  );
}

/**
 * Tipos de erros conhecidos
 */
export const ERROR_CODES = {
  // Erros de validação (400-499)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  
  // Erros de autenticação (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  
  // Erros de permissão (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Erros de não encontrado (404)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  
  // Erros de conflito (409)
  CONFLICT: 'CONFLICT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // Limite de requisições (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Erros do servidor (500-599)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Erros de rede
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // Erros de banco de dados
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
  
  // Erros de negócio
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  INVALID_OPERATION: 'INVALID_OPERATION',
  
  // Erros de integração
  INTEGRATION_ERROR: 'INTEGRATION_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

/**
 * Mapeia códigos de erro para mensagens amigáveis
 */
export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.VALIDATION_ERROR]: 'Erro de validação',
  [ERROR_CODES.INVALID_INPUT]: 'Dados inválidos',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Campo obrigatório não preenchido',
  [ERROR_CODES.INVALID_EMAIL]: 'E-mail inválido',
  [ERROR_CODES.INVALID_PASSWORD]: 'Senha inválida',
  [ERROR_CODES.UNAUTHORIZED]: 'Não autorizado',
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Credenciais inválidas',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Sessão expirada',
  [ERROR_CODES.INVALID_TOKEN]: 'Token inválido',
  [ERROR_CODES.FORBIDDEN]: 'Acesso negado',
  [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 'Permissões insuficientes',
  [ERROR_CODES.NOT_FOUND]: 'Recurso não encontrado',
  [ERROR_CODES.RESOURCE_NOT_FOUND]: 'Recurso não encontrado',
  [ERROR_CODES.CONFLICT]: 'Conflito de dados',
  [ERROR_CODES.DUPLICATE_ENTRY]: 'Registro duplicado',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Muitas requisições. Tente novamente mais tarde.',
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'Erro interno do servidor',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Serviço indisponível',
  [ERROR_CODES.NETWORK_ERROR]: 'Erro de conexão',
  [ERROR_CODES.TIMEOUT]: 'Tempo de requisição esgotado',
  [ERROR_CODES.DATABASE_ERROR]: 'Erro no banco de dados',
  [ERROR_CODES.CONSTRAINT_VIOLATION]: 'Violação de restrição',
  [ERROR_CODES.INSUFFICIENT_STOCK]: 'Estoque insuficiente',
  [ERROR_CODES.INVALID_OPERATION]: 'Operação inválida',
  [ERROR_CODES.INTEGRATION_ERROR]: 'Erro de integração',
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 'Erro em serviço externo',
};

/**
 * Obtém uma mensagem amigável para um código de erro
 */
export function getErrorMessage(code: string, defaultMessage: string = 'Ocorreu um erro'): string {
  return ERROR_MESSAGES[code] || defaultMessage;
}
