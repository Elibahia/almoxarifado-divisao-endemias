import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ErrorHandlerOptions {
  maxRetries?: number;
  retryDelay?: number;
  showToast?: boolean;
  onError?: (error: Error) => void;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    showToast = true,
    onError
  } = options;

  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const getErrorMessage = useCallback((error: any): string => {
    // Network errors
    if (error?.message?.includes('fetch')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    if (error?.message?.includes('timeout')) {
      return 'Tempo limite excedido. Tente novamente.';
    }
    if (error?.message?.includes('network')) {
      return 'Erro de rede. Verifique sua conexão.';
    }

    // Authentication errors
    if (error?.message?.includes('Invalid login credentials')) {
      return 'Email ou senha incorretos.';
    }
    if (error?.message?.includes('Email not confirmed')) {
      return 'Email não confirmado. Verifique sua caixa de entrada.';
    }
    if (error?.message?.includes('Too many requests')) {
      return 'Muitas tentativas. Aguarde alguns minutos.';
    }

    // Database errors
    if (error?.code === 'PGRST301') {
      return 'Sessão expirada. Faça login novamente.';
    }
    if (error?.code === 'PGRST302') {
      return 'Sessão inválida. Faça login novamente.';
    }
    if (error?.code === 'PGRST303') {
      return 'Sessão não encontrada. Faça login novamente.';
    }
    if (error?.code === 'PGRST400') {
      return 'Dados inválidos. Verifique as informações.';
    }
    if (error?.code === 'PGRST404') {
      return 'Recurso não encontrado.';
    }
    if (error?.code === 'PGRST409') {
      return 'Conflito de dados. Verifique as informações.';
    }

    // Generic error
    return error?.message || 'Erro inesperado. Tente novamente.';
  }, []);

  const handleError = useCallback(async (
    operation: () => Promise<any>,
    context: string = 'Operação'
  ): Promise<any> => {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setRetryCount(attempt);
        if (attempt > 0) {
          setIsRetrying(true);
        }

        const result = await operation();
        
        if (attempt > 0) {
          setIsRetrying(false);
          if (showToast) {
            toast({
              title: "Sucesso",
              description: `${context} realizada com sucesso após ${attempt} tentativa(s).`,
            });
          }
        }

        return result;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry certain errors
        if (shouldNotRetry(error as any)) {
          setIsRetrying(false);
          const message = getErrorMessage(error);
          
          if (showToast) {
            toast({
              title: "Erro",
              description: message,
              variant: "destructive",
            });
          }
          
          onError?.(lastError);
          throw error;
        }

        if (attempt === maxRetries) {
          setIsRetrying(false);
          const message = getErrorMessage(error);
          
          if (showToast) {
            toast({
              title: "Erro",
              description: `${message} (${maxRetries + 1} tentativas)`,
              variant: "destructive",
            });
          }
          
          onError?.(lastError);
          throw error;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }

    throw lastError!;
  }, [maxRetries, retryDelay, showToast, onError, getErrorMessage, toast]);

  const resetRetry = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    handleError,
    isRetrying,
    retryCount,
    resetRetry,
  };
}

// Determine if an error should not be retried
function shouldNotRetry(error: any): boolean {
  // Don't retry authentication errors
  if (error?.message?.includes('Invalid login credentials')) return true;
  if (error?.message?.includes('Email not confirmed')) return true;
  if (error?.message?.includes('Too many requests')) return true;
  
  // Don't retry permission errors
  if (error?.code === 'PGRST301') return true; // JWT expired
  if (error?.code === 'PGRST302') return true; // JWT invalid
  if (error?.code === 'PGRST303') return true; // JWT missing
  
  // Don't retry validation errors
  if (error?.code === 'PGRST400') return true; // Bad request
  if (error?.code === 'PGRST404') return true; // Not found
  if (error?.code === 'PGRST409') return true; // Conflict
  
  return false;
}
