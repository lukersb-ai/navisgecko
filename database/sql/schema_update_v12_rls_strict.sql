-- ================================================
-- SCHEMA v12 - SECURITY: Strict RLS (Admin UID only)
-- Uruchom w: Supabase Dashboard → SQL Editor
--
-- INSTRUKCJA:
-- 1. Zaloguj się do Supabase Dashboard
-- 2. Przejdź do Authentication → Users
-- 3. Skopiuj UID swojego konta admina (kolumna "ID")
-- 4. Zamień WSZYSTKIE wystąpienia '079f5251-9e4a-4fc2-beba-7dfba18b78e2' poniżej na swój UID
-- 5. Uruchom skrypt
-- ================================================

-- ==========================================
-- KROK 1: Usuń stare polityki z v11
-- ==========================================
DROP POLICY IF EXISTS "Auth insert geckos"      ON public.geckos;
DROP POLICY IF EXISTS "Auth update geckos"      ON public.geckos;
DROP POLICY IF EXISTS "Auth delete geckos"      ON public.geckos;

DROP POLICY IF EXISTS "Auth insert categories"  ON public.categories;
DROP POLICY IF EXISTS "Auth update categories"  ON public.categories;
DROP POLICY IF EXISTS "Auth delete categories"  ON public.categories;

DROP POLICY IF EXISTS "Auth insert breeders"    ON public.breeders;
DROP POLICY IF EXISTS "Auth update breeders"    ON public.breeders;
DROP POLICY IF EXISTS "Auth delete breeders"    ON public.breeders;

DROP POLICY IF EXISTS "Auth insert caresheets"  ON public.caresheets;
DROP POLICY IF EXISTS "Auth update caresheets"  ON public.caresheets;
DROP POLICY IF EXISTS "Auth delete caresheets"  ON public.caresheets;

DROP POLICY IF EXISTS "Auth write site_content" ON public.site_content;
DROP POLICY IF EXISTS "Auth read app_settings"  ON public.app_settings;
DROP POLICY IF EXISTS "Auth write app_settings" ON public.app_settings;

-- ==========================================
-- KROK 2: Nowe polityki – tylko konkretny UID
-- ==========================================

-- GECKOS: tylko admin może pisać
CREATE POLICY "Admin insert geckos"
  ON public.geckos FOR INSERT
  WITH CHECK (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2');

CREATE POLICY "Admin update geckos"
  ON public.geckos FOR UPDATE
  USING (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2');

CREATE POLICY "Admin delete geckos"
  ON public.geckos FOR DELETE
  USING (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2');

-- CATEGORIES
CREATE POLICY "Admin insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2');

CREATE POLICY "Admin update categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2');

CREATE POLICY "Admin delete categories"
  ON public.categories FOR DELETE
  USING (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2');

-- BREEDERS
CREATE POLICY "Admin insert breeders"
  ON public.breeders FOR INSERT
  WITH CHECK (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2');

CREATE POLICY "Admin update breeders"
  ON public.breeders FOR UPDATE
  USING (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2');

CREATE POLICY "Admin delete breeders"
  ON public.breeders FOR DELETE
  USING (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2');

-- CARESHEETS
CREATE POLICY "Admin insert caresheets"
  ON public.caresheets FOR INSERT
  WITH CHECK (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2');

CREATE POLICY "Admin update caresheets"
  ON public.caresheets FOR UPDATE
  USING (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2');

CREATE POLICY "Admin delete caresheets"
  ON public.caresheets FOR DELETE
  USING (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2');

-- SITE_CONTENT (tylko admin może pisać; publiczny odczyt zachowany z v11)
CREATE POLICY "Admin write site_content"
  ON public.site_content FOR ALL
  USING (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2')
  WITH CHECK (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2');

-- APP_SETTINGS (hasła – dostępne wyłącznie przez admina)
CREATE POLICY "Admin read app_settings"
  ON public.app_settings FOR SELECT
  USING (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2');

CREATE POLICY "Admin write app_settings"
  ON public.app_settings FOR ALL
  USING (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2')
  WITH CHECK (auth.uid() = '079f5251-9e4a-4fc2-beba-7dfba18b78e2');

-- ==========================================
-- GOTOWE! Sprawdź w: Table Editor → każda tabela → RLS policies
-- Oczekiwany wynik: polityki mają konkretny UID, nie "IS NOT NULL"
-- ==========================================
