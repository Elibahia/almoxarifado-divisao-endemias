
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X } from 'lucide-react';

interface PWAUpdatePromptProps {
  onUpdate: () => void;
  onClose: () => void;
}

export function PWAUpdatePrompt({ onUpdate, onClose }: PWAUpdatePromptProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-primary">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Download className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Nova versão disponível</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Uma nova versão do aplicativo está disponível. Atualize para obter as últimas funcionalidades.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={onUpdate} className="text-xs">
                  Atualizar
                </Button>
                <Button size="sm" variant="outline" onClick={onClose} className="text-xs">
                  Depois
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onClose}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function usePWA() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      import('virtual:pwa-register').then(({ registerSW }) => {
        const updateSW = registerSW({
          onNeedRefresh() {
            setNeedRefresh(true);
          },
          onOfflineReady() {
            console.log('App ready to work offline');
          },
        });
        setUpdateSW(() => updateSW);
      });
    }
  }, []);

  const handleUpdate = async () => {
    if (updateSW) {
      await updateSW();
      setNeedRefresh(false);
    }
  };

  const handleClose = () => {
    setNeedRefresh(false);
  };

  return {
    needRefresh,
    handleUpdate,
    handleClose,
  };
}
