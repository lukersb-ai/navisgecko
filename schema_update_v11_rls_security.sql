-- ================================================
-- SCHEMA v11 - SECURITY: Row Level Security (RLS)
-- Uruchom w: Supabase Dashboard → SQL Editor
-- ================================================

-- ==========================
-- 1. WŁĄCZ RLS NA TABELACH
-- ==========================
ALTER TABLE public.geckos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breeders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caresheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- ==========================
-- 2. USUŃ STARE POLITYKI (jeśli istnieją)
-- ==========================
DROP POLICY IF EXISTS "Public read geckos" ON public.geckos;
DROP POLICY IF EXISTS "Auth insert geckos" ON public.geckos;
DROP POLICY IF EXISTS "Auth update geckos" ON public.geckos;
DROP POLICY IF EXISTS "Auth delete geckos" ON public.geckos;

DROP POLICY IF EXISTS "Public read categories" ON public.categories;
DROP POLICY IF EXISTS "Auth insert categories" ON public.categories;
DROP POLICY IF EXISTS "Auth update categories" ON public.categories;
DROP POLICY IF EXISTS "Auth delete categories" ON public.categories;

DROP POLICY IF EXISTS "Public read breeders" ON public.breeders;
DROP POLICY IF EXISTS "Auth insert breeders" ON public.breeders;
DROP POLICY IF EXISTS "Auth update breeders" ON public.breeders;
DROP POLICY IF EXISTS "Auth delete breeders" ON public.breeders;

DROP POLICY IF EXISTS "Public read caresheets" ON public.caresheets;
DROP POLICY IF EXISTS "Auth insert caresheets" ON public.caresheets;
DROP POLICY IF EXISTS "Auth update caresheets" ON public.caresheets;
DROP POLICY IF EXISTS "Auth delete caresheets" ON public.caresheets;

DROP POLICY IF EXISTS "Public read site_content" ON public.site_content;
DROP POLICY IF EXISTS "Auth write site_content" ON public.site_content;

DROP POLICY IF EXISTS "No public access app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Auth read app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Auth write app_settings" ON public.app_settings;

-- ==========================
-- 3. TABELA: geckos
-- Publiczny odczyt, tylko zalogowani mogą pisać
-- ==========================
CREATE POLICY "Public read geckos"
  ON public.geckos FOR SELECT USING (true);

CREATE POLICY "Auth insert geckos"
  ON public.geckos FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auth update geckos"
  ON public.geckos FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth delete geckos"
  ON public.geckos FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ==========================
-- 4. TABELA: categories
-- ==========================
CREATE POLICY "Public read categories"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Auth insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auth update categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth delete categories"
  ON public.categories FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ==========================
-- 5. TABELA: breeders
-- ==========================
CREATE POLICY "Public read breeders"
  ON public.breeders FOR SELECT USING (true);

CREATE POLICY "Auth insert breeders"
  ON public.breeders FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auth update breeders"
  ON public.breeders FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth delete breeders"
  ON public.breeders FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ==========================
-- 6. TABELA: caresheets
-- ==========================
CREATE POLICY "Public read caresheets"
  ON public.caresheets FOR SELECT USING (true);

CREATE POLICY "Auth insert caresheets"
  ON public.caresheets FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auth update caresheets"
  ON public.caresheets FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth delete caresheets"
  ON public.caresheets FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ==========================
-- 7. TABELA: site_content
-- ==========================
CREATE POLICY "Public read site_content"
  ON public.site_content FOR SELECT USING (true);

CREATE POLICY "Auth write site_content"
  ON public.site_content FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ==========================
-- 8. TABELA: app_settings (HASŁA - ściśle chroniona)
-- BRAK odczytu publicznego – dostęp tylko przez RPC check_app_setting
-- ==========================
CREATE POLICY "Auth read app_settings"
  ON public.app_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth write app_settings"
  ON public.app_settings FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ================================================
-- GOTOWE! Sprawdź w: Table Editor → każda tabela → RLS policies
-- Oczekiwany wynik: tabele mają polityki, anon key nie może pisać
-- ================================================
