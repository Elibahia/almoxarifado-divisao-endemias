
-- Criar enum para os papéis de usuário
CREATE TYPE public.user_role AS ENUM ('admin', 'gestor_almoxarifado');

-- Criar tabela de perfis de usuário
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    role public.user_role NOT NULL DEFAULT 'gestor_almoxarifado',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = user_id AND role = 'admin' AND is_active = true
    );
$$;

-- Função para verificar se o usuário tem acesso (admin ou gestor ativo)
CREATE OR REPLACE FUNCTION public.has_access(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = user_id AND is_active = true
    );
$$;

-- Políticas RLS para user_profiles
-- Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (public.is_admin());

-- Gestores podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Apenas admins podem inserir novos usuários
CREATE POLICY "Admins can insert users" ON public.user_profiles
    FOR INSERT WITH CHECK (public.is_admin());

-- Apenas admins podem atualizar usuários
CREATE POLICY "Admins can update users" ON public.user_profiles
    FOR UPDATE USING (public.is_admin());

-- Apenas admins podem deletar usuários
CREATE POLICY "Admins can delete users" ON public.user_profiles
    FOR DELETE USING (public.is_admin());

-- Atualizar políticas das outras tabelas para usar has_access
DROP POLICY IF EXISTS "Public access for products" ON public.products;
CREATE POLICY "Authenticated users can access products" ON public.products
    FOR ALL USING (public.has_access());

DROP POLICY IF EXISTS "Public access for stock movements" ON public.stock_movements;
CREATE POLICY "Authenticated users can access stock movements" ON public.stock_movements
    FOR ALL USING (public.has_access());

DROP POLICY IF EXISTS "Public access for alerts" ON public.alerts;
CREATE POLICY "Authenticated users can access alerts" ON public.alerts
    FOR ALL USING (public.has_access());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        CASE 
            WHEN NEW.email = 'resumovetorial@gmail.com' THEN 'admin'::public.user_role
            ELSE 'gestor_almoxarifado'::public.user_role
        END
    );
    RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Inserir perfil admin se o usuário já existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'resumovetorial@gmail.com') THEN
        INSERT INTO public.user_profiles (id, email, name, role)
        SELECT id, email, COALESCE(raw_user_meta_data->>'name', email), 'admin'::public.user_role
        FROM auth.users 
        WHERE email = 'resumovetorial@gmail.com'
        ON CONFLICT (id) DO UPDATE SET role = 'admin'::public.user_role;
    END IF;
END $$;
