import { CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react'

export const STATUS_CONFIG_MAP = {
  pending: { label: 'Pendente', color: 'bg-yellow-500', icon: Clock },
  approved: { label: 'Aprovado', color: 'bg-blue-500', icon: CheckCircle },
  delivered: { label: 'Entregue', color: 'bg-green-500', icon: Truck },
  received: { label: 'Recebido', color: 'bg-emerald-600', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-500', icon: XCircle },
} as const

export type OrderStatus = keyof typeof STATUS_CONFIG_MAP

export const STATUS_ORDER: OrderStatus[] = [
  'pending',
  'approved',
  'delivered',
  'received',
  'cancelled',
]

export function getStatusConfig(status: string) {
  return (
    (STATUS_CONFIG_MAP as Record<string, typeof STATUS_CONFIG_MAP[OrderStatus]>)[status] || {
      label: 'Desconhecido',
      color: 'bg-gray-500',
      icon: Package,
    }
  )
}


