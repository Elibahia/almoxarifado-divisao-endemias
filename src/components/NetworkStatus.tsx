import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { networkStatus } from '@/integrations/supabase/client';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(networkStatus.getStatus());
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  useEffect(() => {
    const unsubscribe = networkStatus.subscribe((online) => {
      setIsOnline(online);
      if (!online) {
        setShowOfflineAlert(true);
      } else {
        // Hide offline alert after a short delay when back online
        setTimeout(() => {
          setShowOfflineAlert(false);
        }, 3000);
      }
    });

    return unsubscribe;
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  if (!showOfflineAlert) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert variant={isOnline ? "default" : "destructive"}>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <AlertDescription className="flex-1">
            {isOnline 
              ? "Conexão restaurada! Algumas funcionalidades podem ter sido afetadas."
              : "Você está offline. Algumas funcionalidades podem não estar disponíveis."
            }
          </AlertDescription>
          {!isOnline && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Tentar
            </Button>
          )}
        </div>
      </Alert>
    </div>
  );
}
