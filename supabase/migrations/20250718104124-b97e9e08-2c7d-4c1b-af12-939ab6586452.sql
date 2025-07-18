
-- Criar tabela para armazenar os pedidos
CREATE TABLE public.order_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_name TEXT NOT NULL,
    subdistrict TEXT NOT NULL,
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    observations TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, delivered, cancelled
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- Criar tabela para armazenar os itens de cada pedido
CREATE TABLE public.order_request_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_request_id UUID NOT NULL REFERENCES public.order_requests(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_of_measure TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS nas tabelas
ALTER TABLE public.order_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_request_items ENABLE ROW LEVEL SECURITY;

-- Políticas para order_requests
CREATE POLICY "Authenticated users can view order requests" 
    ON public.order_requests 
    FOR SELECT 
    USING (has_access());

CREATE POLICY "Authenticated users can create order requests" 
    ON public.order_requests 
    FOR INSERT 
    WITH CHECK (has_access() AND auth.uid() = created_by);

CREATE POLICY "Admins can update order requests" 
    ON public.order_requests 
    FOR UPDATE 
    USING (is_admin());

-- Políticas para order_request_items
CREATE POLICY "Authenticated users can view order request items" 
    ON public.order_request_items 
    FOR SELECT 
    USING (has_access());

CREATE POLICY "Authenticated users can create order request items" 
    ON public.order_request_items 
    FOR INSERT 
    WITH CHECK (has_access());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_order_requests_updated_at
    BEFORE UPDATE ON public.order_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para melhorar performance
CREATE INDEX idx_order_requests_subdistrict ON public.order_requests(subdistrict);
CREATE INDEX idx_order_requests_status ON public.order_requests(status);
CREATE INDEX idx_order_requests_created_at ON public.order_requests(created_at);
CREATE INDEX idx_order_request_items_order_id ON public.order_request_items(order_request_id);
