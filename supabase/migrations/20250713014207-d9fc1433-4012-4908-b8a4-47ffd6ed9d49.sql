-- Temporariamente permitir operações para usuários anônimos até implementar autenticação
-- Atualizar políticas para permitir acesso público temporário

-- Remover políticas existentes para produtos
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;

-- Criar políticas temporárias para acesso público
CREATE POLICY "Public access for products" 
    ON public.products FOR ALL 
    TO public 
    USING (true)
    WITH CHECK (true);

-- Atualizar políticas para stock_movements
DROP POLICY IF EXISTS "Authenticated users can view stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Authenticated users can insert stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Authenticated users can update stock movements" ON public.stock_movements;

CREATE POLICY "Public access for stock movements" 
    ON public.stock_movements FOR ALL 
    TO public 
    USING (true)
    WITH CHECK (true);

-- Atualizar políticas para alerts
DROP POLICY IF EXISTS "Authenticated users can view alerts" ON public.alerts;
DROP POLICY IF EXISTS "Authenticated users can insert alerts" ON public.alerts;
DROP POLICY IF EXISTS "Authenticated users can update alerts" ON public.alerts;
DROP POLICY IF EXISTS "Authenticated users can delete alerts" ON public.alerts;

CREATE POLICY "Public access for alerts" 
    ON public.alerts FOR ALL 
    TO public 
    USING (true)
    WITH CHECK (true);