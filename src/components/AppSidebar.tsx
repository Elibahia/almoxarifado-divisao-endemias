
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

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard
  },
  {
    title: "Produtos",
    url: "/products",
    icon: Package
  },
  {
    title: "Movimentações",
    url: "/movements",
    icon: ArrowUpDown
  },
  {
    title: "Solicitar Pedidos",
    url: "/order-requests",
    icon: ShoppingCart
  },
  {
    title: "Gerenciar Pedidos",
    url: "/order-management",
    icon: CheckSquare
  },
  {
    title: "Relatórios",
    url: "/reports",
    icon: BarChart3
  },
  {
    title: "Alertas",
    url: "/alerts",
    icon: AlertTriangle
  },
  {
    title: "Usuários",
    url: "/users",
    icon: Users
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings
  }
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
