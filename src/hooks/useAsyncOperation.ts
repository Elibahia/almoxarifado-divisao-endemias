import { useState, useCallback, useRef, useMemo } from 'react';
import { ErrorService } from '@/services/errorService';

interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retryCount: number;
  lastExecutedAt?: Date;
}

interface UseAsyncOperationOptions<T = any> {
  /** Nome da operação para logs de erro */
  operationName?: string;
  /** Número máximo de tentativas */
  maxRetries?: number;
  /** Atraso entre tentativas (em ms) */
  retryDelay?: number;
  /** Chamado quando a operação é bem-sucedida */
  onSuccess?: (data: T) => void;
  /** Chamado quando ocorre um erro */
  onError?: (error: Error) => void;
  /** Se deve mostrar notificação de erro */
  showErrorNotification?: boolean;
  /** Se deve lançar o erro após todas as tentativas */
  throwOnError?: boolean;
}

export function useAsyncOperation<T = any>(
  operation: () => Promise<T>,
  options: UseAsyncOperationOptions<T> = {}
) {
  const {
    operationName = 'anonymous_operation',
    maxRetries = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    showErrorNotification = true,
    throwOnError = false,
  } = options;


  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
    retryCount: 0
  });

  const operationRef = useRef(operation);
  operationRef.current = operation;

  const execute = useCallback(async (): Promise<T | null> => {
    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      lastExecutedAt: new Date()
    }));

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operationRef.current();
        
        setState(prev => ({
          ...prev,
          data: result,
          loading: false,
          retryCount: attempt,
          lastExecutedAt: new Date()
        }));

        onSuccess?.(result);
        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        lastError = errorObj;
        
        // Log do erro
        if (showErrorNotification) {
          ErrorService.handle(
            errorObj, 
            `${operationName} (tentativa ${attempt + 1}/${maxRetries + 1})`
          );
        }
        
        if (attempt === maxRetries) {
          const errorMessage = errorObj.message || 'Erro desconhecido';
          
          setState(prev => ({
            ...prev,
            loading: false,
            error: errorMessage,
            retryCount: attempt,
            lastExecutedAt: new Date()
          }));
          
          onError?.(errorObj);
          
          if (throwOnError) {
            throw errorObj;
          }
          
          return null;
        }

        // Espera exponencial entre tentativas
        if (attempt < maxRetries) {
          const delay = retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return null;
  }, [maxRetries, retryDelay, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      retryCount: 0
    });
  }, []);

  // Retorna o estado e funções úteis
  return useMemo(() => ({
    ...state,
    execute,
    reset,
    // Função para executar a operação novamente
    retry: () => {
      if (!state.loading) {
        return execute();
      }
      return Promise.resolve(null);
    },
    // Se houve erro na última execução
    hasError: !!state.error,
    // Se está carregando
    isLoading: state.loading,
    // Dados da última execução bem-sucedida
    data: state.data,
    // Tempo desde a última execução
    timeSinceLastExecution: state.lastExecutedAt 
      ? new Date().getTime() - state.lastExecutedAt.getTime() 
      : null
  }), [state, execute, reset]);
}
