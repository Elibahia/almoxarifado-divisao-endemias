-- Permitir que gestores de almoxarifado atualizem pedidos
-- Esta migração corrige as permissões para que gestor_almoxarifado possa aprovar, entregar e marcar pedidos como recebidos

-- 1. Criar função is_gestor se não existir
CREATE OR REPLACE FUNCTION public.is_gestor(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = user_id AND role = 'gestor_almoxarifado' AND is_active = true
    );
$$;

-- 2. Remover política restritiva atual
DROP POLICY IF EXISTS "Admins can update order requests" ON public.order_requests;

-- 3. Criar nova política que permite admins E gestores
CREATE POLICY "Managers can update order requests"
    ON public.order_requests
    FOR UPDATE
    USING (public.is_admin() OR public.is_gestor())
    WITH CHECK (public.is_admin() OR public.is_gestor());

-- 4. Comentário para documentar a mudança
COMMENT ON POLICY "Managers can update order requests" ON public.order_requests IS 
'Permite que administradores e gestores de almoxarifado atualizem status de pedidos (aprovar, entregar, marcar como recebido)';