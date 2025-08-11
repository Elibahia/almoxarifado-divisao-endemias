-- Grant Gestor Almoxarifado permissions to update order requests statuses
-- 1) Create helper function is_gestor (mirrors is_admin style)
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

-- 2) Replace restrictive update policy on order_requests to allow admins and gestores
DROP POLICY IF EXISTS "Admins can update order requests" ON public.order_requests;

CREATE POLICY "Managers can update order requests"
    ON public.order_requests
    FOR UPDATE
    USING (public.is_admin() OR public.is_gestor())
    WITH CHECK (public.is_admin() OR public.is_gestor());