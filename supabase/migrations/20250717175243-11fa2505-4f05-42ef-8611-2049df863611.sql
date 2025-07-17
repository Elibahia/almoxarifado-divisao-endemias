
-- Adicionar coluna unit_of_measure na tabela products
ALTER TABLE public.products 
ADD COLUMN unit_of_measure TEXT NOT NULL DEFAULT 'unid.';

-- Criar um índice para melhorar performance em consultas por unidade de medida
CREATE INDEX idx_products_unit_of_measure ON public.products(unit_of_measure);
