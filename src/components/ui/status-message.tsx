import { AlertCircle, AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusMessageProps {
  type: 'loading' | 'error' | 'success' | 'info' | 'warning';
  message: string;
  className?: string;
  iconClassName?: string;
  showIcon?: boolean;
}

export function StatusMessage({
  type,
  message,
  className = '',
  iconClassName = '',
  showIcon = true,
}: StatusMessageProps) {
  const icons = {
    loading: <Loader2 className={cn('h-4 w-4 animate-spin', iconClassName)} />,
    error: <AlertCircle className={cn('h-4 w-4', iconClassName)} />,
    warning: <AlertTriangle className={cn('h-4 w-4', iconClassName)} />,
    success: <CheckCircle2 className={cn('h-4 w-4', iconClassName)} />,
    info: <Info className={cn('h-4 w-4', iconClassName)} />,
  };

  const colors = {
    loading: 'bg-blue-50 text-blue-700 border-blue-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div
      className={cn(
        'p-3 rounded-md border flex items-start gap-3',
        colors[type],
        className
      )}
      role="status"
      aria-live={type === 'loading' ? 'polite' : 'assertive'}
    >
      {showIcon && <div className="flex-shrink-0">{icons[type]}</div>}
      <div className="text-sm">{message}</div>
    </div>
  );
}
