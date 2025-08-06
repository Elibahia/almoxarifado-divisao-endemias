
import { ReactNode } from 'react';
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
import { useIsMobile, useChromeStability } from "@/hooks/use-mobile-detection";
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
  const { isChromeMobile, hasViewportIssues } = useChromeStability();
  
  const alertCount = alerts.filter(alert => !alert.is_read).length;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado com sucesso",
        description: "Até logo!",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <div 
        className={cn(
          "min-h-screen flex w-full bg-background",
          // Fix para Chrome mobile
          isChromeMobile && "min-h-[100dvh]",
          hasViewportIssues && "pb-safe"
        )}
        style={{
          // Fallback para problemas de height no Chrome mobile
          minHeight: isChromeMobile ? '100dvh' : '100vh'
        }}
      >
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b bg-card shadow-sm">
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
                  isMobile && "touch-target active:scale-95"
                )}
                onClick={() => navigate('/alerts')}
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
                      isMobile && "touch-target active:scale-95"
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
              "flex-1 p-4 md:p-6 overflow-auto",
              // Ajuste do padding bottom para mobile
              isMobile ? "pb-24" : "pb-6"
            )}
            style={{
              // Fix para scroll no Chrome mobile
              WebkitOverflowScrolling: 'touch',
              // Fix para viewport issues
              paddingBottom: isMobile && hasViewportIssues ? '6rem' : undefined
            }}
          >
            {children}
          </main>
          
          {/* Mobile Navigation Bar */}
          <MobileNavBar />
        </div>
      </div>
    </SidebarProvider>
  );
}
