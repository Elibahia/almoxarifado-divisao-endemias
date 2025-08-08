
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

  // Verificações de segurança para evitar erros
  if (!location) {
    return null
  }

  // Filtrar itens do menu baseado na role do usuário
  const filteredMenuItems = menuItems.filter(item => {
    if (!userProfile?.role || !item?.roles) return false
    return item.roles.includes(userProfile.role)
  })

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => {
                // Verificações de segurança para cada item
                if (!item || !item.icon || !item.url || !item.title) {
                  console.warn('Item de menu inválido:', item)
                  return null
                }

                const IconComponent = item.icon
                
                return (
                  <SidebarMenuItem key={item.url}>
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
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
