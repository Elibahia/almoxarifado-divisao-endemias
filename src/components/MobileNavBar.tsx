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

  // Filtra os itens de menu com base na função do usuário
  const filteredNavItems = navItems.filter(item => 
    userProfile && item.roles.includes(userProfile.role)
  );

  // Limita a 5 itens para a barra de navegação
  const visibleNavItems = filteredNavItems.slice(0, 4);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50 shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between px-2 max-w-md mx-auto w-full relative">
        {visibleNavItems.map((item) => (
          <Link 
            key={item.title}
            to={item.url}
            className={cn(
              "flex flex-col items-center py-3 px-3 min-w-[4rem] transition-colors duration-200",
              location.pathname === item.url 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-full mb-1 relative",
              location.pathname === item.url ? "bg-primary/10" : ""
            )}>
              <item.icon className="h-5 w-5" />
              {location.pathname === item.url && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </div>
            <span className="text-xs font-medium">{item.title}</span>
          </Link>
        ))}
        
        {/* Menu button for additional items */}
        <SidebarTrigger className="flex flex-col items-center py-3 px-3 min-w-[4rem] text-muted-foreground hover:text-foreground transition-colors duration-200">
          <div className="p-1 rounded-full mb-1">
            <Menu className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">Menu</span>
        </SidebarTrigger>
      </div>
    </div>
  );
}