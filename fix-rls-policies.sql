-- Script para corrigir as políticas RLS e permitir que gestores de almoxarifado atualizem pedidos
-- Execute este script no painel do Supabase (SQL Editor)

-- 1. Primeiro, vamos criar a função is_gestor se ela não existir
CREATE OR REPLACE FUNCTION is_gestor(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = user_id 
    AND role IN ('admin', 'gestor_almoxarifado')
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Remover as políticas existentes de atualização
DROP POLICY IF EXISTS "Admins can update order requests" ON order_requests;
DROP POLICY IF EXISTS "Gestores can update order requests" ON order_requests;
DROP POLICY IF EXISTS "Users can update their own order requests" ON order_requests;

-- 3. Criar nova política que permite gestores e admins atualizarem pedidos
CREATE POLICY "Gestores and admins can update order requests" ON order_requests
  FOR UPDATE
  USING (
    -- Permite se o usuário é gestor ou admin
    is_gestor(auth.uid())
    OR
    -- Ou se é o próprio usuário que criou o pedido (apenas para status 'cancelled')
    (created_by = auth.uid() AND status = 'pending')
  )
  WITH CHECK (
    -- Permite se o usuário é gestor ou admin
    is_gestor(auth.uid())
    OR
    -- Ou se é o próprio usuário cancelando seu pedido
    (created_by = auth.uid() AND status = 'cancelled')
  );

-- 4. Verificar se as políticas foram aplicadas corretamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'order_requests'
ORDER BY policyname;

-- 5. Testar a função is_gestor
SELECT 
  id,
  email,
  role,
  is_active,
  is_gestor(id) as can_manage_orders
FROM user_profiles
WHERE role IN ('admin', 'gestor_almoxarifado')
ORDER BY role, email;

-- 6. Verificar permissões atuais
SELECT 
  'order_requests' as table_name,
  'SELECT' as operation,
  has_table_privilege(current_user, 'order_requests', 'SELECT') as has_permission
UNION ALL
SELECT 
  'order_requests' as table_name,
  'UPDATE' as operation,
  has_table_privilege(current_user, 'order_requests', 'UPDATE') as has_permission
UNION ALL
SELECT 
  'order_requests' as table_name,
  'INSERT' as operation,
  has_table_privilege(current_user, 'order_requests', 'INSERT') as has_permission;

-- Comentários sobre o que foi feito:
-- 1. Criamos/atualizamos a função is_gestor para verificar se um usuário é gestor ou admin
-- 2. Removemos políticas conflitantes que poderiam estar causando problemas
-- 3. Criamos uma nova política unificada que permite:
--    - Gestores e admins atualizarem qualquer pedido
--    - Usuários comuns cancelarem seus próprios pedidos pendentes
-- 4. Adicionamos queries de verificação para confirmar que tudo está funcionando

-- IMPORTANTE: Execute este script no SQL Editor do painel do Supabase
-- Após executar, teste a funcionalidade na aplicação