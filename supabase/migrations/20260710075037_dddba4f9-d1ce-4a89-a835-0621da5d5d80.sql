
-- Add product management fields
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS is_best_seller boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS products_is_best_seller_idx ON public.products(is_best_seller) WHERE is_best_seller = true;
CREATE INDEX IF NOT EXISTS products_sku_idx ON public.products(sku) WHERE sku IS NOT NULL;
