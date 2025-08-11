# Análise de Performance e Recomendações de Otimização

## Resumo Executivo

Após análise detalhada do código, identifiquei **10 oportunidades principais de otimização** que podem melhorar significativamente a performance da aplicação. O projeto já possui boas práticas implementadas (virtualização, memoização de hooks), mas existem áreas específicas que podem se beneficiar de otimizações adicionais.

## 🎯 Problemas Identificados e Soluções

### 1. **Componentes Sem Memoização (Alto Impacto)**

#### Problema:
Componentes que renderizam frequentemente sem `React.memo()`:
- `OrderTable` (`src/components/orders/OrderTable.tsx`)
- `OrderMobileCards` (`src/components/orders/OrderMobileCards.tsx`)
- `OrderProductRow` (`src/components/orders/OrderProductRow.tsx`)

#### Impacto:
- Re-renderizações desnecessárias quando props não mudam
- Performance degradada com listas grandes de pedidos
- CPU usage elevado durante atualizações de estado

#### Solução:
```javascript
// OrderTable.tsx
import { memo } from 'react';

export const OrderTable = memo(function OrderTable({
  orders,
  selectedOrder,
  setSelectedOrder,
  onStatusUpdate,
  onDeleteOrder,
  isPending,
}: OrderTableProps) {
  // ... componente atual
}, (prevProps, nextProps) => {
  return (
    prevProps.orders === nextProps.orders &&
    prevProps.selectedOrder === nextProps.selectedOrder &&
    prevProps.isPending === nextProps.isPending
  );
});
```

### 2. **Operações de Array Pesadas Sem Memoização (Alto Impacto)**

#### Problema:
No `useOrderFilters.ts`, operações custosas executam a cada render:
```javascript
const getStatusCounts = () => {
  const activeCount = orders.filter(order => 
    order.status === 'pending' || order.status === 'approved'
  ).length;
  // Mais filtros...
};
```

#### Impacto:
- Cálculos pesados repetidos desnecessariamente
- Performance degradada com muitos pedidos
- Latência na UI durante filtragem

#### Solução:
```javascript
// useOrderFilters.ts
const statusCounts = useMemo(() => {
  const activeCount = orders.filter(order => 
    order.status === 'pending' || order.status === 'approved'
  ).length;
  
  const completedCount = orders.filter(order => 
    order.status === 'delivered' || order.status === 'received'
  ).length;
  
  const cancelledCount = orders.filter(order => 
    order.status === 'cancelled'
  ).length;

  return { activeCount, completedCount, cancelledCount, total: orders.length };
}, [orders]);
```

### 3. **Funções Não Memoizadas em Props (Médio Impacto)**

#### Problema:
Callbacks passados para componentes filhos sem `useCallback()`:
- `OrderTable` e `OrderMobileCards` recebem funções que podem ser recriadas
- `OrderProductRow` recebe callbacks não memoizados

#### Impacto:
- Props instáveis causam re-renderizações desnecessárias
- Quebra da memoização de componentes filhos

#### Solução:
```javascript
// OrderManagement.tsx
const handleStatusUpdate = useCallback(async (orderId: string, status: OrderStatus) => {
  try {
    await updateOrderStatus.mutateAsync({ orderId, status });
  } catch (error) {
    console.error('Error updating status:', error);
  }
}, [updateOrderStatus]);

const handleDeleteOrder = useCallback(async (orderId: string) => {
  try {
    await deleteOrder.mutateAsync(orderId);
  } catch (error) {
    console.error('Error deleting order:', error);
  }
}, [deleteOrder]);
```

### 4. **Transformação de Dados Custosa (Médio Impacto)**

#### Problema:
No `useOrderRequests.ts`, transformação complexa dos dados do Supabase:
```javascript
return orders.map(order => ({
  // Transformação pesada para cada pedido
  items: items
    .filter(item => item.order_request_id === order.id)
    .map(item => ({ /* ... */ })),
}));
```

#### Impacto:
- Processamento pesado a cada fetch
- Múltiplas iterações sobre arrays grandes
- Bloqueio da UI durante carregamento

#### Solução:
```javascript
// useOrderRequests.ts
const transformedOrders = useMemo(() => {
  if (!orders || !items) return [];
  
  // Criar índice para otimizar lookup
  const itemsByOrderId = items.reduce((acc, item) => {
    if (!acc[item.order_request_id]) {
      acc[item.order_request_id] = [];
    }
    acc[item.order_request_id].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return orders.map(order => ({
    ...order,
    items: itemsByOrderId[order.id] || [],
  }));
}, [orders, items]);
```

### 5. **Cálculos de Status Repetitivos (Médio Impacto)**

#### Problema:
No `useProducts.ts`, cálculo do status do produto executado repetidamente:
```javascript
const calculateProductStatus = useCallback((item: DbProduct): ProductStatus => {
  // Cálculos de data custosos
  const expirationDate = new Date(item.expiration_date);
  const today = new Date();
  const timeDiff = expirationDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  // ...
}, []);
```

#### Impacto:
- Cálculos de data executados multiple vezes
- Performance degradada com muitos produtos

#### Solução:
```javascript
// Mover cálculos para um worker ou usar cache
const calculateProductStatus = useMemo(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return (item: DbProduct): ProductStatus => {
    const expirationDate = new Date(item.expiration_date);
    expirationDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysDiff < 0) return ProductStatus.EXPIRED;
    if ((item.current_quantity ?? 0) === 0) return ProductStatus.OUT_OF_STOCK;
    if ((item.current_quantity ?? 0) <= (item.minimum_quantity ?? 0)) return ProductStatus.LOW_STOCK;
    return ProductStatus.ACTIVE;
  };
}, []); // Recalcular apenas diariamente
```

### 6. **Exportação de CSV Bloqueante (Baixo-Médio Impacto)**

#### Problema:
A função `exportToCsv` em `utils/exportCsv.ts` é síncrona e pode bloquear a UI com datasets grandes.

#### Impacto:
- UI bloqueada durante exportação
- Experiência do usuário prejudicada

#### Solução:
```javascript
// utils/exportCsv.ts
export const exportToCsvAsync = async (data: any[], filenameBase: string) => {
  return new Promise((resolve) => {
    // Usar requestIdleCallback para não bloquear a UI
    requestIdleCallback(() => {
      const csvContent = "data:text/csv;charset=utf-8," + 
        data.map(row => Object.values(row).join(",")).join("\n");
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('download', `${filenameBase}.csv`);
      link.setAttribute('href', url);
      link.click();
      URL.revokeObjectURL(url);
      resolve(true);
    });
  });
};
```

### 7. **Fetching Desnecessário (Médio Impacto)**

#### Problema:
No `useAuth.ts`, múltiplas chamadas para buscar o perfil do usuário:
```javascript
const fetchUserProfile = async (user: User) => {
  // Fetch executado múltiplas vezes
};
```

#### Impacto:
- Requests desnecessários ao banco
- Latência adicional

#### Solução:
```javascript
// useAuth.ts
const fetchUserProfile = useCallback(async (user: User) => {
  // Implementar cache local
  const cachedProfile = sessionStorage.getItem(`profile_${user.id}`);
  if (cachedProfile) {
    const profile = JSON.parse(cachedProfile);
    // Verificar se cache ainda é válido (ex: 10 minutos)
    if (Date.now() - profile.timestamp < 600000) {
      setUserProfile(profile.data);
      return;
    }
  }

  // Fetch apenas se necessário
  const result = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (result.data) {
    const profileWithTimestamp = {
      data: result.data,
      timestamp: Date.now()
    };
    sessionStorage.setItem(`profile_${user.id}`, JSON.stringify(profileWithTimestamp));
    setUserProfile(result.data);
  }
}, []);
```

### 8. **Virtualização Faltante para Pedidos (Alto Impacto)**

#### Problema:
`OrderTable` e `OrderMobileCards` não usam virtualização para grandes listas de pedidos.

#### Impacto:
- DOM bloat com muitos pedidos
- Performance degradada drasticamente com +100 pedidos
- Scrolling lag

#### Solução:
```javascript
// VirtualizedOrderTable.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export const VirtualizedOrderTable = memo(({ orders, ...props }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // altura estimada da linha
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <OrderTableRow
            key={virtualRow.key}
            order={orders[virtualRow.index]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualRow.size,
              transform: `translateY(${virtualRow.start}px)`,
            }}
            {...props}
          />
        ))}
      </div>
    </div>
  );
});
```

### 9. **Monitoramento de Performance Custoso (Baixo Impacto)**

#### Problema:
`usePerformanceMonitor.ts` pode impactar performance em produção.

#### Impacto:
- Overhead de logging em produção
- Consumo de memória desnecessário

#### Solução:
```javascript
// usePerformanceMonitor.ts
const isDevelopment = process.env.NODE_ENV === 'development';

export function usePerformanceMonitor() {
  const measureOperation = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    if (!isDevelopment) {
      return operation(); // Skip monitoring in production
    }
    
    // Monitoring logic apenas em desenvolvimento
    const startTime = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      if (duration > 1000) { // Log apenas operações lentas
        console.warn(`Slow operation: ${operationName} took ${duration}ms`);
      }
      return result;
    } catch (error) {
      console.error(`Failed operation: ${operationName}`, error);
      throw error;
    }
  }, []);
}
```

### 10. **Debounce Insuficiente (Baixo-Médio Impacto)**

#### Problema:
No `ProductFilters`, debounce de 300ms pode ainda ser agressivo para datasets grandes.

#### Impacto:
- Filtragem ainda executada frequentemente
- CPU usage elevado durante digitação

#### Solução:
```javascript
// useProductFilters.ts
const debouncedSetSearchTerm = useMemo(
  () => debounce((value: string) => setSearchTerm(value), 500), // Aumentar para 500ms
  []
);

// Implementar cancelamento de requests
const abortControllerRef = useRef<AbortController>();

const filteredProducts = useMemo(() => {
  // Cancelar filtração anterior se ainda em andamento
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
  
  abortControllerRef.current = new AbortController();
  
  return products.filter(product => {
    // Verificar se operação foi cancelada
    if (abortControllerRef.current?.signal.aborted) {
      return false;
    }
    
    // Lógica de filtração
    return searchProducts(product, deferredSearchTerm);
  });
}, [products, deferredSearchTerm, searchProducts]);
```

## 📊 Impacto Estimado das Otimizações

| Otimização | Impacto | Esforço | Prioridade |
|------------|---------|---------|------------|
| Memoização de Componentes | Alto | Baixo | 🔴 Crítico |
| Virtualização de Pedidos | Alto | Médio | 🔴 Crítico |
| Memoização de Operações de Array | Alto | Baixo | 🟡 Alto |
| Cache de Perfil do Usuário | Médio | Baixo | 🟡 Alto |
| Otimização de Transformação de Dados | Médio | Médio | 🟡 Alto |
| Callbacks Memoizados | Médio | Baixo | 🟢 Médio |
| Cálculos de Status Otimizados | Médio | Médio | 🟢 Médio |
| Exportação Assíncrona | Baixo-Médio | Baixo | 🟢 Médio |
| Debounce Otimizado | Baixo-Médio | Baixo | 🟢 Baixo |
| Performance Monitor Condicional | Baixo | Baixo | 🟢 Baixo |

## 🎯 Plano de Implementação Recomendado

### Fase 1 (Semana 1): Crítico
1. Implementar memoização em `OrderTable`, `OrderMobileCards`, `OrderProductRow`
2. Adicionar `useMemo` para `statusCounts` em `useOrderFilters`
3. Memoizar callbacks principais em `OrderManagement`

### Fase 2 (Semana 2): Alto Impacto  
4. Implementar virtualização para listas de pedidos
5. Otimizar transformação de dados em `useOrderRequests`
6. Adicionar cache de perfil do usuário

### Fase 3 (Semana 3): Melhorias Adicionais
7. Otimizar cálculos de status de produtos
8. Implementar exportação assíncrona
9. Melhorar debounce e cancelamento

### Fase 4 (Semana 4): Polimento
10. Condicionar performance monitor
11. Testes de performance e ajustes finais

## 🧪 Métricas de Sucesso

- **Tempo de renderização inicial**: Redução de 30-50%
- **Re-renderizações desnecessárias**: Redução de 60-80%  
- **Tempo de filtragem**: Redução de 40-60%
- **Uso de memória**: Redução de 20-30%
- **FPS durante scroll**: Melhoria de 15-30fps

## 📝 Notas Importantes

1. **Testes são essenciais**: Cada otimização deve ser testada individualmente
2. **Monitoring**: Implementar métricas para medir impacto real
3. **Fallbacks**: Manter código legacy durante transição
4. **Mobile**: Focar especialmente em performance mobile
5. **Dados de produção**: Testar com volumes realistas de dados

## ✅ Boas Práticas Já Implementadas

O projeto já possui várias otimizações excelentes:
- ✅ `VirtualizedProductTable` para produtos
- ✅ `useCallback` em hooks principais
- ✅ `useMemo` em operações custosas
- ✅ Debounce em filtros
- ✅ `React.memo` em `ProductTableRow`
- ✅ `useDeferredValue` para atualizações não críticas

Esta análise fornece um roadmap claro para otimizações que podem resultar em melhorias significativas de performance, especialmente em cenários com grandes volumes de dados.