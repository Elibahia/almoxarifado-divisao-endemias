
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNavBar } from "@/components/MobileNavBar";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAlerts } from "@/hooks/useAlerts";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useIsMobile, useChromeStability, usePWAStability } from "@/hooks/use-mobile-detection";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { signOut, userProfile } = useAuth();
  const { toast } = useToast();
  const { alerts = [] } = useAlerts();
  const { isMobile } = useIsMobile();
  const { isChromeMobile, hasViewportIssues, isStandalone } = useChromeStability();
  const { isPWA } = usePWAStability();
  
  const alertCount = alerts.filter(alert => !alert.is_read).length;

  // Fix para problemas de navegação mobile
  useEffect(() => {
    if (isMobile) {
      // Prevenir zoom acidental no mobile
      const metaViewport = document.querySelector('meta[name=viewport]');
      if (metaViewport) {
        metaViewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        );
      }

      // Fix para altura em dispositivos mobile
      const updateVH = () => {
        try {
          const vh = window.innerHeight * 0.01;
          document.documentElement.style.setProperty('--vh', `${vh}px`);
        } catch (error) {
          console.error('Error setting VH:', error);
        }
      };

      updateVH();
      window.addEventListener('resize', updateVH, { passive: true });
      window.addEventListener('orientationchange', () => {
        setTimeout(updateVH, 300);
      }, { passive: true });

      return () => {
        window.removeEventListener('resize', updateVH);
        window.removeEventListener('orientationchange', updateVH);
      };
    }
  }, [isMobile]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado com sucesso",
        description: "Até logo!",
      });
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Erro ao sair",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleNavigation = (path: string) => {
    try {
      navigate(path);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback para navegação manual
      window.location.href = path;
    }
  };

  return (
    <SidebarProvider>
      <div 
        className={cn(
          "min-h-screen flex w-full bg-background relative",
          // Fix para Chrome mobile e PWA
          (isChromeMobile || isPWA) && "min-h-[100dvh]",
          hasViewportIssues && "pb-safe-area-inset-bottom",
          // Prevenção de overflow horizontal no mobile
          isMobile && "overflow-x-hidden"
        )}
        style={{
          // Fallback para problemas de height no Chrome mobile
          minHeight: (isChromeMobile || isPWA) ? 'calc(var(--vh, 1vh) * 100)' : '100vh',
          // Fix para safe area em dispositivos com notch
          paddingTop: isStandalone ? 'env(safe-area-inset-top, 0px)' : undefined
        }}
      >
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className={cn(
            "h-16 flex items-center justify-between px-4 md:px-6 border-b bg-card shadow-sm relative z-40",
            // Fix para header no PWA
            isStandalone && "pt-safe-area-inset-top"
          )}>
            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
              <SidebarTrigger className="md:flex hidden" />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">
                  <span className="hidden sm:inline">Sistema de Almoxarifado</span>
                  <span className="sm:hidden">Almoxarifado</span>
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                  Gestão de Estoque Divisão de Endemias
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "relative",
                  // Melhor área de toque para mobile
                  isMobile && "touch-manipulation active:scale-95 transition-transform"
                )}
                onClick={() => handleNavigation('/alerts')}
              >
                <Bell className="h-5 w-5" />
                {alertCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {alertCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={cn(
                      isMobile && "touch-manipulation active:scale-95 transition-transform"
                    )}
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    {userProfile?.name || userProfile?.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main 
            className={cn(
              "flex-1 p-4 md:p-6 overflow-auto relative",
              // Ajuste do padding bottom para mobile
              isMobile ? "pb-24" : "pb-6",
              // Fix para scroll no mobile
              isMobile && "overscroll-behavior-y-contain"
            )}
            style={{
              // Fix para scroll no Chrome mobile e PWA
              WebkitOverflowScrolling: 'touch',
              // Fix para viewport issues
              paddingBottom: isMobile && hasViewportIssues ? 'calc(6rem + env(safe-area-inset-bottom, 0px))' : undefined,
              // Altura mínima para conteúdo
              minHeight: isMobile ? 'calc(100vh - 8rem)' : 'auto'
            }}
          >
            <div className="w-full max-w-full">
              {children}
            </div>
          </main>
          
          {/* Mobile Navigation Bar */}
          <MobileNavBar />
        </div>
      </div>
    </SidebarProvider>
  );
}
