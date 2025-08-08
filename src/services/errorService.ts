import { toast } from '@/hooks/use-toast';

export class ErrorService {
  static handle(error: unknown, context: string) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : 'Ocorreu um erro inesperado';

    console.error(`[${context}]`, error);
    
    toast({
      variant: "destructive",
      title: "Erro",
      description: errorMessage,
    });

    // Opcional: Enviar para serviço de monitoramento
    // this.logToService(error, context);
  }

  static logToService(error: unknown, context: string) {
    // Implementar envio para Sentry/LogRocket/etc
    console.log(`[Monitoramento] Erro em ${context}:`, error);
  }
}
