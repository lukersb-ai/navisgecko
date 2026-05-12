-- ========================================================
-- SECURITY HARDENING: Comprehensive RLS & Privacy Guard
-- Uruchom w: Supabase Dashboard → SQL Editor
-- ========================================================

-- INSTRUKCJA:
-- 1. Zamień '079f5251-9e4a-4fc2-beba-7dfba18b78e2' na swój UID admina.
-- 2. Uruchom skrypt.

-- ========================================================
-- 1. WŁĄCZENIE RLS DLA WSZYSTKICH TABEL (Bez tego polityki nie działają!)
-- ========================================================
ALTER TABLE public.geckos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breeders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caresheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- 2. CZYSZCZENIE STARYCH POLITYK (Dla pewności)
-- ========================================================
DO $$ 
BEGIN
    EXECUTE (SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON ' || quote_ident(tablename) || ';', ' ')
             FROM pg_policies WHERE schemaname = 'public');
END $$;

-- ========================================================
-- 3. POLITYKI DLA TABELI: geckos
-- ========================================================

-- Admin: Pełny dostęp
CREATE POLICY "Admin full access geckos" ON public.geckos
  FOR ALL USING (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2')
  WITH CHECK (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2');

-- Public: Widzi tylko publiczne, nietajne i nie-premium oferty
CREATE POLICY "Public read geckos" ON public.geckos
  FOR SELECT USING (
    "isHidden" = false 
    AND "isSecret" = false 
    AND "isPremium" = false
  );

-- ========================================================
-- 4. POLITYKI DLA TABELI: categories
-- ========================================================

-- Admin: Pełny dostęp
CREATE POLICY "Admin full access categories" ON public.categories
  FOR ALL USING (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2')
  WITH CHECK (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2');

-- Public: Widzi tylko kategorie, które nie są prywatne
CREATE POLICY "Public read categories" ON public.categories
  FOR SELECT USING ("isPrivate" = false);

-- ========================================================
-- 5. POLITYKI DLA TABELI: app_settings (Kluczowe!)
-- ========================================================

-- CAŁKOWITA BLOKADA: Nikt poza adminem nie może czytać tej tabeli bezpośrednio.
-- To zapobiega podejrzeniu haseł w "Network Tab".
CREATE POLICY "Admin access settings" ON public.app_settings
  FOR ALL USING (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2')
  WITH CHECK (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2');

-- Brak polityki SELECT dla public = brak dostępu (404/Empty).

-- ========================================================
-- 6. BEZPIECZNA FUNKCJA DO SPRAWDZANIA HASEŁ (RPC)
-- ========================================================
-- Funkcja działa z uprawnieniami właściciela (SECURITY DEFINER), 
-- co pozwala jej sprawdzić hasło w zablokowanej tabeli app_settings,
-- ale NIE zwraca samego hasła użytkownikowi.

CREATE OR REPLACE FUNCTION check_app_setting(setting_id TEXT, input_value TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER -- Ważne: pozwala na dostęp do zablokowanej tabeli
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.app_settings 
        WHERE id = setting_id AND value = input_value
    );
END;
$$;

-- ========================================================
-- 7. POLITYKI DLA POZOSTAŁYCH TABEL
-- ========================================================

-- Breeders & Caresheets & Content: Admin wszystko, Public tylko czytanie
CREATE POLICY "Admin full breeders" ON public.breeders FOR ALL USING (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2');
CREATE POLICY "Public read breeders" ON public.breeders FOR SELECT USING (true);

CREATE POLICY "Admin full caresheets" ON public.caresheets FOR ALL USING (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2');
CREATE POLICY "Public read caresheets" ON public.caresheets FOR SELECT USING (true);

CREATE POLICY "Admin full site_content" ON public.site_content FOR ALL USING (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2');
CREATE POLICY "Public read site_content" ON public.site_content FOR SELECT USING (true);

-- ========================================================
-- 8. FIX: Public Bucket Allows Listing (Linter 0025)
-- ========================================================
-- Usuwamy zbyt szeroką politykę SELECT, która pozwalała każdemu 
-- na listowanie wszystkich plików w wiaderku 'geckos'.
-- Obrazy nadal będą działać, bo wiaderko jest oznaczone jako 'public'.
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- ========================================================
-- 9. FIX: Secure SECURITY DEFINER Function (Linter 0028/0029)
-- ========================================================
-- Odbieramy uprawnienia do wykonywania funkcji check_app_setting 
-- wszystkim (PUBLIC) oraz rolom anon/authenticated.
-- Funkcja powinna być wywoływana tylko przez serwer (np. Service Role).

REVOKE EXECUTE ON FUNCTION public.check_app_setting(TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_app_setting(TEXT, TEXT) FROM anon, authenticated;

-- GRANT dla administratora (Service Role), aby mógł sprawdzać hasła
GRANT EXECUTE ON FUNCTION public.check_app_setting(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_app_setting(TEXT, TEXT) TO postgres;

-- Zaktualizowana polityka dla app_settings (dostęp dla admina UID oraz roli service_role)
DROP POLICY IF EXISTS "Admin access settings" ON public.app_settings;
CREATE POLICY "Admin access settings" ON public.app_settings
  FOR ALL USING (
    auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2' 
    OR (auth.jwt() ->> 'role' = 'service_role')
  );

-- ========================================================
-- 10. PERFORMANCE: Database Indexes for Sorting & Filtering
-- ========================================================
-- Optymalizacja pod darmowy plan Supabase (przyspiesza ORDER BY i WHERE).

-- Indeksy dla tabeli gekonów
CREATE INDEX IF NOT EXISTS idx_geckos_sort_order ON public.geckos(sort_order);
CREATE INDEX IF NOT EXISTS idx_geckos_category_id ON public.geckos("categoryId");

-- Indeksy dla tabeli hodowlanej
CREATE INDEX IF NOT EXISTS idx_breeders_sort_order ON public.breeders(sort_order);
CREATE INDEX IF NOT EXISTS idx_breeders_category_id ON public.breeders("categoryId");
