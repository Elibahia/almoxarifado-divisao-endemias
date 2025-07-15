
-- Inserir usuário admin no auth.users
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud,
    instance_id
) VALUES (
    gen_random_uuid(),
    'resumovetorial@gmail.com',
    crypt('Zrci872@', gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    '',
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Admin User"}',
    false,
    'authenticated',
    'authenticated',
    '00000000-0000-0000-0000-000000000000'
) ON CONFLICT (email) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    updated_at = now();

-- Garantir que o perfil seja criado corretamente
INSERT INTO public.user_profiles (id, email, name, role, is_active)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'name', 'Admin User'),
    'admin'::public.user_role,
    true
FROM auth.users u
WHERE u.email = 'resumovetorial@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    role = 'admin'::public.user_role,
    is_active = true,
    updated_at = now();
