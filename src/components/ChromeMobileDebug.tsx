
import { useState, useEffect } from 'react';
import { useIsMobile, useChromeStability } from '@/hooks/use-mobile-detection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, RefreshCw } from 'lucide-react';

interface DebugInfo {
  userAgent: string;
  innerWidth: number;
  innerHeight: number;
  clientWidth: number;
  clientHeight: number;
  visualViewport?: {
    width: number;
    height: number;
    scale: number;
  };
  touchSupport: boolean;
  orientation?: number;
}

export function ChromeMobileDebug() {
  const { isMobile } = useIsMobile();
  const { isChromeMobile, hasViewportIssues } = useChromeStability();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const updateDebugInfo = () => {
    const info: DebugInfo = {
      userAgent: navigator.userAgent,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      clientWidth: document.documentElement.clientWidth,
      clientHeight: document.documentElement.clientHeight,
      touchSupport: 'ontouchstart' in window,
      orientation: window.orientation
    };

    if ('visualViewport' in window && window.visualViewport) {
      info.visualViewport = {
        width: window.visualViewport.width,
        height: window.visualViewport.height,
        scale: window.visualViewport.scale
      };
    }

    setDebugInfo(info);
  };

  useEffect(() => {
    updateDebugInfo();
    
    const handleResize = () => updateDebugInfo();
    const handleOrientationChange = () => setTimeout(updateDebugInfo, 300);
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    if ('visualViewport' in window && window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if ('visualViewport' in window && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  // Só mostrar em modo de desenvolvimento e em Chrome mobile
  if (!isChromeMobile || process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-sm">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDebug(!showDebug)}
        className="mb-2 bg-background"
      >
        {hasViewportIssues && <AlertTriangle className="h-4 w-4 mr-2 text-warning" />}
        <Info className="h-4 w-4 mr-2" />
        Debug
      </Button>
      
      {showDebug && (
        <Card className="bg-background/95 backdrop-blur-sm border-warning">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              Chrome Mobile Debug
              <Button
                variant="ghost"
                size="sm"
                onClick={updateDebugInfo}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Mobile:</span>
                <span className={isMobile ? "text-success" : "text-muted-foreground"}>
                  {isMobile ? "Sim" : "Não"}
                </span>
                
                <span className="text-muted-foreground">Chrome Mobile:</span>
                <span className={isChromeMobile ? "text-warning" : "text-muted-foreground"}>
                  {isChromeMobile ? "Sim" : "Não"}
                </span>
                
                <span className="text-muted-foreground">Viewport Issues:</span>
                <span className={hasViewportIssues ? "text-error" : "text-success"}>
                  {hasViewportIssues ? "Sim" : "Não"}
                </span>
                
                <span className="text-muted-foreground">Touch:</span>
                <span>{debugInfo?.touchSupport ? "Sim" : "Não"}</span>
              </div>
              
              {debugInfo && (
                <>
                  <hr className="border-muted" />
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Window:</span>
                    <span>{debugInfo.innerWidth}x{debugInfo.innerHeight}</span>
                    
                    <span className="text-muted-foreground">Client:</span>
                    <span>{debugInfo.clientWidth}x{debugInfo.clientHeight}</span>
                    
                    {debugInfo.visualViewport && (
                      <>
                        <span className="text-muted-foreground">Visual:</span>
                        <span>{Math.round(debugInfo.visualViewport.width)}x{Math.round(debugInfo.visualViewport.height)}</span>
                        
                        <span className="text-muted-foreground">Scale:</span>
                        <span>{debugInfo.visualViewport.scale.toFixed(2)}</span>
                      </>
                    )}
                    
                    {debugInfo.orientation !== undefined && (
                      <>
                        <span className="text-muted-foreground">Orientation:</span>
                        <span>{debugInfo.orientation}°</span>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
