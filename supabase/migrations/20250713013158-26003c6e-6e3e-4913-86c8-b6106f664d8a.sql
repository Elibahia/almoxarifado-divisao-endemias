
-- Criar tabela de produtos
CREATE TABLE public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    batch TEXT NOT NULL,
    expiration_date DATE NOT NULL,
    minimum_quantity INTEGER NOT NULL DEFAULT 0,
    current_quantity INTEGER NOT NULL DEFAULT 0,
    location TEXT,
    supplier TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de movimentações de estoque
CREATE TABLE public.stock_movements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'entry', 'exit', 'adjustment', 'transfer'
    quantity INTEGER NOT NULL,
    reason TEXT NOT NULL,
    responsible_user TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    notes TEXT,
    invoice_number TEXT
);

-- Criar tabela de alertas
CREATE TABLE public.alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL, -- 'expiring_soon', 'low_stock', 'expired', 'out_of_stock'
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ativar RLS em todas as tabelas
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Políticas para produtos (permitir todas as operações para usuários autenticados)
CREATE POLICY "Authenticated users can view products" 
    ON public.products FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Authenticated users can insert products" 
    ON public.products FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update products" 
    ON public.products FOR UPDATE 
    TO authenticated 
    USING (true);

CREATE POLICY "Authenticated users can delete products" 
    ON public.products FOR DELETE 
    TO authenticated 
    USING (true);

-- Políticas para movimentações de estoque
CREATE POLICY "Authenticated users can view stock movements" 
    ON public.stock_movements FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Authenticated users can insert stock movements" 
    ON public.stock_movements FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update stock movements" 
    ON public.stock_movements FOR UPDATE 
    TO authenticated 
    USING (true);

-- Políticas para alertas
CREATE POLICY "Authenticated users can view alerts" 
    ON public.alerts FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Authenticated users can insert alerts" 
    ON public.alerts FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update alerts" 
    ON public.alerts FOR UPDATE 
    TO authenticated 
    USING (true);

CREATE POLICY "Authenticated users can delete alerts" 
    ON public.alerts FOR DELETE 
    TO authenticated 
    USING (true);

-- Função para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente na tabela products
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON public.products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar alertas automaticamente
CREATE OR REPLACE FUNCTION generate_product_alerts()
RETURNS TRIGGER AS $$
BEGIN
    -- Limpar alertas antigos para este produto
    DELETE FROM public.alerts WHERE product_id = NEW.id;
    
    -- Verificar se está vencido
    IF NEW.expiration_date < CURRENT_DATE THEN
        INSERT INTO public.alerts (type, product_id, message, severity)
        VALUES ('expired', NEW.id, 'Produto ' || NEW.name || ' está vencido', 'critical');
    
    -- Verificar se está próximo do vencimento (30 dias)
    ELSIF NEW.expiration_date <= CURRENT_DATE + INTERVAL '30 days' THEN
        INSERT INTO public.alerts (type, product_id, message, severity)
        VALUES ('expiring_soon', NEW.id, 'Produto ' || NEW.name || ' vence em breve', 'high');
    END IF;
    
    -- Verificar estoque baixo
    IF NEW.current_quantity <= NEW.minimum_quantity AND NEW.current_quantity > 0 THEN
        INSERT INTO public.alerts (type, product_id, message, severity)
        VALUES ('low_stock', NEW.id, 'Produto ' || NEW.name || ' com estoque baixo', 'medium');
    
    -- Verificar se está esgotado
    ELSIF NEW.current_quantity = 0 THEN
        INSERT INTO public.alerts (type, product_id, message, severity)
        VALUES ('out_of_stock', NEW.id, 'Produto ' || NEW.name || ' esgotado', 'high');
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para gerar alertas automaticamente
CREATE TRIGGER generate_alerts_on_product_change
    AFTER INSERT OR UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION generate_product_alerts();
