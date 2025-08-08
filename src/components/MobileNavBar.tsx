
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
import { useIsMobile } from "@/hooks/use-mobile-detection";

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

  // Verificações de segurança
  if (!location || !isMobile) {
    return null;
  }

  // Filtrar itens baseado na role do usuário
  const filteredNavItems = navItems.filter(item => {
    if (!userProfile?.role || !item?.roles) return false;
    return item.roles.includes(userProfile.role);
  });

  // Mostrar apenas os primeiros 4 itens
  const visibleNavItems = filteredNavItems.slice(0, 4);

  if (!visibleNavItems.length) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50 shadow-lg">
      <div className="flex items-center justify-between px-2 py-2 max-w-md mx-auto w-full">
        {visibleNavItems.map((item) => {
          // Verificações de segurança para cada item
          if (!item || !item.icon || !item.url || !item.title) {
            console.warn('Item de navegação móvel inválido:', item);
            return null;
          }

          const IconComponent = item.icon;
          
          return (
            <Link 
              key={item.url}
              to={item.url}
              className={cn(
                "flex flex-col items-center py-2 px-3 min-w-[4rem] transition-colors",
                location.pathname === item.url 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-full mb-1",
                location.pathname === item.url ? "bg-primary/10" : ""
              )}>
                <IconComponent className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          );
        })}
        
        <SidebarTrigger 
          className="flex flex-col items-center py-2 px-3 min-w-[4rem] text-muted-foreground hover:text-foreground transition-colors"
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
