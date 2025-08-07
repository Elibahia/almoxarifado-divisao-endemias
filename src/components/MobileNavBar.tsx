
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard,
  Package,
  ArrowUpDown,
  ShoppingCart,
  CheckSquare,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile, useChromeStability, usePWAStability } from "@/hooks/use-mobile-detection";
import { useEffect, useState, useCallback } from "react";

// Definição mais robusta dos itens de menu
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

  // Filtragem mais segura dos itens de menu
  const filteredNavItems = navItems.filter(item => {
    try {
      // Verificações de segurança detalhadas
      if (!item) {
        console.warn('Nav item is null or undefined:', item);
        return false;
      }

      if (typeof item !== 'object') {
        console.warn('Nav item is not an object:', item);
        return false;
      }

      if (!item.roles || !Array.isArray(item.roles)) {
        console.warn('Nav item roles are invalid:', item);
        return false;
      }

      if (!item.icon || typeof item.icon !== 'function') {
        console.warn('Nav item icon is invalid:', item);
        return false;
      }

      if (!item.title || typeof item.title !== 'string') {
        console.warn('Nav item title is invalid:', item);
        return false;
      }

      if (!item.url || typeof item.url !== 'string') {
        console.warn('Nav item url is invalid:', item);
        return false;
      }

      // Verificar userProfile
      if (!userProfile || !userProfile.role) {
        console.warn('User profile or role is missing in MobileNavBar:', userProfile);
        return false;
      }

      return item.roles.includes(userProfile.role);
    } catch (error) {
      console.error('Error filtering nav item:', error, item);
      return false;
    }
  });

  // Limita a 4 itens com verificação adicional
  const visibleNavItems = filteredNavItems.slice(0, 4).filter(item => {
    try {
      return item && 
             item.icon && 
             typeof item.icon === 'function' && 
             item.title && 
             typeof item.title === 'string' && 
             item.url && 
             typeof item.url === 'string';
    } catch (error) {
      console.error('Error validating visible nav item:', error, item);
      return false;
    }
  });

  // Controle de visibilidade com proteção contra erros
  const handleScroll = useCallback(() => {
    try {
      if (!window || typeof window.scrollY !== 'number') {
        return;
      }

      const currentScrollY = window.scrollY;
      
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

    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          try {
            handleScroll();
            ticking = false;
          } catch (error) {
            console.error('Throttled scroll error:', error);
            ticking = false;
          }
        });
        ticking = true;
      }
    };

    try {
      window.addEventListener('scroll', throttledHandleScroll, { 
        passive: true,
        capture: false 
      });
      
      return () => {
        try {
          window.removeEventListener('scroll', throttledHandleScroll);
        } catch (error) {
          console.error('Error removing scroll listener:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up scroll listener:', error);
    }
  }, [isMobile, handleScroll]);

  // Handlers de touch com proteção
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    try {
      const target = e.currentTarget as HTMLElement;
      if (target && target.style) {
        target.style.transform = 'scale(0.95)';
      }
      if (e.touches && e.touches.length === 1) {
        e.preventDefault();
      }
    } catch (error) {
      console.error('Touch start error:', error);
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    try {
      const target = e.currentTarget as HTMLElement;
      if (target && target.style) {
        target.style.transform = 'scale(1)';
      }
    } catch (error) {
      console.error('Touch end error:', error);
    }
  }, []);

  // Log para debug com verificação
  useEffect(() => {
    try {
      console.log('MobileNavBar state:', {
        isMobile,
        isChromeMobile,
        hasViewportIssues,
        isStandalone,
        isPWA,
        isVisible,
        userRole: userProfile?.role,
        itemCount: visibleNavItems.length,
        pathname: location?.pathname,
        filteredItems: filteredNavItems.length,
        hasValidItems: visibleNavItems.every(item => item && item.icon && typeof item.icon === 'function')
      });
    } catch (error) {
      console.error('Error logging MobileNavBar state:', error);
    }
  }, [isMobile, isChromeMobile, hasViewportIssues, isStandalone, isPWA, isVisible, userProfile, visibleNavItems.length, location?.pathname, filteredNavItems.length]);

  // Não renderizar se não for mobile ou não houver itens válidos
  if (!isMobile || !visibleNavItems.length) {
    return null;
  }

  return (
    <div 
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50 shadow-lg transition-transform duration-300",
        isVisible ? "translate-y-0" : "translate-y-full",
        (hasViewportIssues || isPWA || isStandalone) && "pb-safe-area-inset-bottom"
      )}
      style={{
        paddingBottom: (hasViewportIssues || isPWA || isStandalone) ? 
          'max(16px, env(safe-area-inset-bottom, 0px))' : '16px',
        zIndex: (isChromeMobile || isPWA) ? 9999 : 50,
        willChange: 'transform',
        backfaceVisibility: 'hidden'
      }}
    >
      <div className="flex items-center justify-between px-2 max-w-md mx-auto w-full relative">
        {visibleNavItems.map((item, index) => {
          try {
            // Verificação final antes de renderizar
            if (!item || !item.icon || !item.title || !item.url) {
              console.warn('Invalid nav item at render:', item);
              return null;
            }

            const IconComponent = item.icon;
            
            if (typeof IconComponent !== 'function') {
              console.warn('IconComponent is not a function in MobileNavBar:', IconComponent);
              return null;
            }

            return (
              <Link 
                key={`${item.title}-${item.url}-${index}`}
                to={item.url}
                className={cn(
                  "flex flex-col items-center py-3 px-3 min-w-[4rem] transition-all duration-200",
                  "touch-manipulation select-none",
                  location.pathname === item.url 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground",
                  "active:bg-muted/50 active:scale-95",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-md"
                )}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={(e) => {
                  try {
                    e.preventDefault();
                  } catch (error) {
                    console.error('Touch move error:', error);
                  }
                }}
              >
                <div className={cn(
                  "p-1.5 rounded-full mb-1 relative transition-colors",
                  location.pathname === item.url ? "bg-primary/10" : ""
                )}>
                  <IconComponent className="h-5 w-5" />
                  {location.pathname === item.url && (
                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </div>
                <span className="text-xs font-medium truncate max-w-12">{item.title}</span>
              </Link>
            );
          } catch (error) {
            console.error('Error rendering nav item:', error, item);
            return null;
          }
        })}
        
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
