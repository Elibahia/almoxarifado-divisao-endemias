import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard,
  Package,
  ArrowUpDown,
  ShoppingCart,
  CheckSquare,
  BarChart3,
  AlertTriangle,
  Users,
  Settings,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile, useChromeStability, usePWAStability } from "@/hooks/use-mobile-detection";
import { useEffect, useState, useCallback } from "react";

// Definição dos itens de menu com ícones
const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    roles: ["admin", "gestor_almoxarifado", "supervisor_geral"]
  },
  {
    title: "Produtos",
    url: "/products",
    icon: Package,
    roles: ["admin", "gestor_almoxarifado"]
  },
  {
    title: "Movimentações",
    url: "/movements",
    icon: ArrowUpDown,
    roles: ["admin", "gestor_almoxarifado"]
  },
  {
    title: "Solicitar",
    url: "/order-requests",
    icon: ShoppingCart,
    roles: ["admin", "gestor_almoxarifado", "supervisor_geral"]
  },
  {
    title: "Pedidos",
    url: "/order-management",
    icon: CheckSquare,
    roles: ["admin", "gestor_almoxarifado", "supervisor_geral"]
  }
];

export function MobileNavBar() {
  const location = useLocation();
  const { userProfile } = useAuth();
  const { isMobile } = useIsMobile();
  const { isChromeMobile, hasViewportIssues, isStandalone } = useChromeStability();
  const { isPWA } = usePWAStability();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Filtra os itens de menu com base na função do usuário
  const filteredNavItems = navItems.filter(item => 
    userProfile && item.roles.includes(userProfile.role)
  );

  // Limita a 4 itens para a barra de navegação
  const visibleNavItems = filteredNavItems.slice(0, 4);

  // Controle de visibilidade otimizado
  const handleScroll = useCallback(() => {
    try {
      const currentScrollY = window.scrollY;
      
      // Esconder barra ao rolar para baixo, mostrar ao rolar para cima
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    } catch (error) {
      console.error('Scroll handler error:', error);
    }
  }, [lastScrollY]);

  useEffect(() => {
    if (!isMobile) return;

    // Throttle do scroll para melhor performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { 
      passive: true,
      capture: false 
    });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [isMobile, handleScroll]);

  // Prevenção de bugs de touch
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    try {
      const target = e.currentTarget as HTMLElement;
      target.style.transform = 'scale(0.95)';
      // Prevenir bounce scroll no iOS
      if (e.touches.length === 1) {
        e.preventDefault();
      }
    } catch (error) {
      console.error('Touch start error:', error);
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    try {
      const target = e.currentTarget as HTMLElement;
      target.style.transform = 'scale(1)';
    } catch (error) {
      console.error('Touch end error:', error);
    }
  }, []);

  // Log para debug
  useEffect(() => {
    console.log('MobileNavBar state:', {
      isMobile,
      isChromeMobile,
      hasViewportIssues,
      isStandalone,
      isPWA,
      isVisible,
      userRole: userProfile?.role,
      itemCount: visibleNavItems.length,
      pathname: location.pathname
    });
  }, [isMobile, isChromeMobile, hasViewportIssues, isStandalone, isPWA, isVisible, userProfile, visibleNavItems.length, location.pathname]);

  // Não renderizar se não for mobile
  if (!isMobile) {
    return null;
  }

  return (
    <div 
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50 shadow-lg transition-transform duration-300",
        isVisible ? "translate-y-0" : "translate-y-full",
        // Fix específico para diferentes tipos de mobile
        (hasViewportIssues || isPWA || isStandalone) && "pb-safe-area-inset-bottom"
      )}
      style={{
        // Fallback para problemas de viewport
        paddingBottom: (hasViewportIssues || isPWA || isStandalone) ? 
          'max(16px, env(safe-area-inset-bottom, 0px))' : '16px',
        // Fix para z-index em diferentes browsers mobile
        zIndex: (isChromeMobile || isPWA) ? 9999 : 50,
        // Prevenção de problemas de rendering
        willChange: 'transform',
        backfaceVisibility: 'hidden'
      }}
    >
      <div className="flex items-center justify-between px-2 max-w-md mx-auto w-full relative">
        {visibleNavItems.map((item) => (
          <Link 
            key={item.title}
            to={item.url}
            className={cn(
              "flex flex-col items-center py-3 px-3 min-w-[4rem] transition-all duration-200",
              "touch-manipulation select-none",
              location.pathname === item.url 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground",
              // Melhor área de toque para mobile
              "active:bg-muted/50 active:scale-95",
              // Fix para problemas de foco
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-md"
            )}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            // Prevenção de double tap zoom
            onTouchMove={(e) => e.preventDefault()}
          >
            <div className={cn(
              "p-1.5 rounded-full mb-1 relative transition-colors",
              location.pathname === item.url ? "bg-primary/10" : ""
            )}>
              <item.icon className="h-5 w-5" />
              {location.pathname === item.url && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </div>
            <span className="text-xs font-medium truncate max-w-12">{item.title}</span>
          </Link>
        ))}
        
        {/* Menu button for additional items */}
        <SidebarTrigger 
          className={cn(
            "flex flex-col items-center py-3 px-3 min-w-[4rem]",
            "text-muted-foreground hover:text-foreground transition-all duration-200",
            "touch-manipulation select-none",
            "active:bg-muted/50 active:scale-95",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-md"
          )}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="p-1 rounded-full mb-1">
            <Menu className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">Menu</span>
        </SidebarTrigger>
      </div>
    </div>
  );
}
