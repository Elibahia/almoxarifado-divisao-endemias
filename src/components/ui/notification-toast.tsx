import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

export interface NotificationToast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationToastProps {
  toast: NotificationToast;
  onRemove: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export function NotificationToastComponent({ toast, onRemove }: NotificationToastProps) {
  const Icon = iconMap[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${colorMap[toast.type]} shadow-lg animate-in slide-in-from-right-full`}>
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium">{toast.title}</p>
        {toast.message && (
          <p className="text-sm mt-1 opacity-90">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-current opacity-60 hover:opacity-100 transition-opacity"
      >
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  );
}

export function NotificationToastContainer() {
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  const addToast = (toast: Omit<NotificationToast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Make addToast available globally
  useEffect(() => {
    (window as any).addNotificationToast = addToast;
    return () => {
      delete (window as any).addNotificationToast;
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <NotificationToastComponent
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
}

// Helper function to show toasts
export const showNotificationToast = (toast: Omit<NotificationToast, 'id'>) => {
  if ((window as any).addNotificationToast) {
    (window as any).addNotificationToast(toast);
  }
};