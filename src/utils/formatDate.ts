import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDate(date: Date | string | number, pattern = 'dd/MM/yyyy') {
  try {
    return format(new Date(date), pattern, { locale: ptBR })
  } catch (error) {
    // Fallback seguro caso a data venha inválida
    return ''
  }
}


