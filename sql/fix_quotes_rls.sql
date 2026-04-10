-- ============================================================
-- FIX: RLS policies para quotes y quote_items
-- ============================================================
-- Las tablas quotes y quote_items tienen RLS habilitado pero sin
-- policies para el rol "authenticated", por lo que TODA escritura
-- desde el cliente Supabase (logueado) era rechazada con 42501.
--
-- Este script habilita CRUD para usuarios autenticados, igual al
-- patrón que ya tienen orders/customers/products/cash_movements.
-- ============================================================

-- Asegurar RLS habilitado
ALTER TABLE public.quotes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

-- ---------- quotes ----------
DROP POLICY IF EXISTS "quotes_select_authenticated" ON public.quotes;
DROP POLICY IF EXISTS "quotes_insert_authenticated" ON public.quotes;
DROP POLICY IF EXISTS "quotes_update_authenticated" ON public.quotes;
DROP POLICY IF EXISTS "quotes_delete_authenticated" ON public.quotes;

CREATE POLICY "quotes_select_authenticated"
  ON public.quotes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "quotes_insert_authenticated"
  ON public.quotes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "quotes_update_authenticated"
  ON public.quotes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "quotes_delete_authenticated"
  ON public.quotes FOR DELETE
  TO authenticated
  USING (true);

-- ---------- quote_items ----------
DROP POLICY IF EXISTS "quote_items_select_authenticated" ON public.quote_items;
DROP POLICY IF EXISTS "quote_items_insert_authenticated" ON public.quote_items;
DROP POLICY IF EXISTS "quote_items_update_authenticated" ON public.quote_items;
DROP POLICY IF EXISTS "quote_items_delete_authenticated" ON public.quote_items;

CREATE POLICY "quote_items_select_authenticated"
  ON public.quote_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "quote_items_insert_authenticated"
  ON public.quote_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "quote_items_update_authenticated"
  ON public.quote_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "quote_items_delete_authenticated"
  ON public.quote_items FOR DELETE
  TO authenticated
  USING (true);
