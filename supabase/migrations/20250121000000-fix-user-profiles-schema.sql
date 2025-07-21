-- Verificar e corrigir a estrutura da tabela user_profiles
-- Esta migração garante que a coluna 'name' existe na tabela

-- Verificar se a coluna 'name' existe, se não existir, adicionar
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'name'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN name TEXT;
    END IF;
END $$;

-- Atualizar a função handle_new_user para garantir que funcione corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, user_profiles.name),
        updated_at = now();
    RETURN NEW;
END;
$function$;

-- Recriar o trigger para garantir que está funcionando
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Atualizar registros existentes que possam não ter o campo name
UPDATE public.user_profiles 
SET name = COALESCE(name, email) 
WHERE name IS NULL;