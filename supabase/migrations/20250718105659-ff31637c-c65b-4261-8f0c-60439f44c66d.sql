
-- Adicionar a nova função 'supervisor_geral' ao enum user_role
ALTER TYPE public.user_role ADD VALUE 'supervisor_geral';

-- Verificar se a função foi adicionada corretamente
SELECT unnest(enum_range(NULL::public.user_role));
