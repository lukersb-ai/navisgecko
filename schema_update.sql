-- Aktualizacja Bazy Danych - Kopiuj do edytora SQL w Supabase i naciśnij RUN 🚀

-- 1. Aktualizacja Gekonów o Cene i Gatunek
ALTER TABLE public.geckos ADD COLUMN IF NOT EXISTS "price" NUMERIC DEFAULT 0;
ALTER TABLE public.geckos ADD COLUMN IF NOT EXISTS "categoryId" TEXT DEFAULT 'leopard-gecko';

-- 2. Stworzenie tabeli dla uniwersalnych treści (O nas, Hero, Kontakt)
CREATE TABLE IF NOT EXISTS public.site_content (
    id TEXT PRIMARY KEY,
    content_pl JSONB,
    content_en JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public site_content view" ON public.site_content;
CREATE POLICY "Public site_content view" ON public.site_content FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert content" ON public.site_content;
CREATE POLICY "Enable insert content" ON public.site_content FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update content" ON public.site_content;
CREATE POLICY "Enable update content" ON public.site_content FOR UPDATE USING (true);

-- 3. Stworzenie strukturalnej tabeli Poradników (Kafelki zostają!)
CREATE TABLE IF NOT EXISTS public.caresheets (
    id TEXT PRIMARY KEY,
    "namePl" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "descriptionPl" TEXT,
    "descriptionEn" TEXT,
    "coverImage" TEXT,
    cards JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.caresheets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public caresheets view" ON public.caresheets;
CREATE POLICY "Public caresheets view" ON public.caresheets FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert cares" ON public.caresheets;
CREATE POLICY "Enable insert cares" ON public.caresheets FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update cares" ON public.caresheets;
CREATE POLICY "Enable update cares" ON public.caresheets FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete cares" ON public.caresheets;
CREATE POLICY "Enable delete cares" ON public.caresheets FOR DELETE USING (true);
