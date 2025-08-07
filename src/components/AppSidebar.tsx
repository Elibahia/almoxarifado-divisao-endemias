
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { 
  BarChart3,
  Package,
  ArrowUpDown,
  AlertTriangle,
  Users,
  Settings,
  ShoppingCart,
  LayoutDashboard,
  CheckSquare
} from "lucide-react"
import { useLocation, Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

const menuItems = [
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
    title: "Solicitar Pedidos",
    url: "/order-requests",
    icon: ShoppingCart,
    roles: ["admin", "gestor_almoxarifado", "supervisor_geral"]
  },
  {
    title: "Gerenciar Pedidos",
    url: "/order-management",
    icon: CheckSquare,
    roles: ["admin", "gestor_almoxarifado", "supervisor_geral"]
  },
  {
    title: "Relatórios",
    url: "/reports",
    icon: BarChart3,
    roles: ["admin", "gestor_almoxarifado"]
  },
  {
    title: "Alertas",
    url: "/alerts",
    icon: AlertTriangle,
    roles: ["admin", "gestor_almoxarifado"]
  },
  {
    title: "Usuários",
    url: "/users",
    icon: Users,
    roles: ["admin"]
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
    roles: ["admin", "gestor_almoxarifado"]
  }
]

export function AppSidebar() {
  const location = useLocation()
  const { userProfile } = useAuth()

  // Verificação mais robusta dos itens de menu
  const filteredMenuItems = menuItems.filter(item => {
    try {
      // Verificações de segurança mais detalhadas
      if (!item) {
        console.warn('Menu item is null or undefined:', item);
        return false;
      }

      if (typeof item !== 'object') {
        console.warn('Menu item is not an object:', item);
        return false;
      }

      if (!item.roles || !Array.isArray(item.roles)) {
        console.warn('Menu item roles are invalid:', item);
        return false;
      }

      if (!item.icon || typeof item.icon !== 'function') {
        console.warn('Menu item icon is invalid:', item);
        return false;
      }

      if (!item.title || typeof item.title !== 'string') {
        console.warn('Menu item title is invalid:', item);
        return false;
      }

      if (!item.url || typeof item.url !== 'string') {
        console.warn('Menu item url is invalid:', item);
        return false;
      }

      // Verificar se o userProfile existe e tem role
      if (!userProfile || !userProfile.role) {
        console.warn('User profile or role is missing:', userProfile);
        return false;
      }

      return item.roles.includes(userProfile.role);
    } catch (error) {
      console.error('Error filtering menu item:', error, item);
      return false;
    }
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item, index) => {
                try {
                  // Verificação adicional antes de renderizar
                  if (!item || !item.icon || !item.title || !item.url) {
                    console.warn('Invalid menu item at render:', item);
                    return null;
                  }

                  const IconComponent = item.icon;

                  // Verificar se IconComponent é uma função válida
                  if (typeof IconComponent !== 'function') {
                    console.warn('IconComponent is not a function:', IconComponent);
                    return null;
                  }

                  return (
                    <SidebarMenuItem key={`${item.title}-${item.url}-${index}`}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location.pathname === item.url}
                      >
                        <Link to={item.url}>
                          <IconComponent />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                } catch (error) {
                  console.error('Error rendering menu item:', error, item);
                  return null;
                }
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
