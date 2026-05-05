-- Aktualizacja V6 - ZAŁATANIE KRYTYCZNEJ LUKI BEZPIECZEŃSTWA (RLS)
-- Kopiuj do edytora SQL w Supabase i naciśnij RUN 🚀

-- 1. Zabezpieczenie tabeli geckos
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.geckos;
DROP POLICY IF EXISTS "Enable update for everyone" ON public.geckos;
DROP POLICY IF EXISTS "Enable delete for everyone" ON public.geckos;

CREATE POLICY "Enable insert authenticated" ON public.geckos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update authenticated" ON public.geckos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete authenticated" ON public.geckos FOR DELETE USING (auth.role() = 'authenticated');

-- 2. Zabezpieczenie tabeli categories
DROP POLICY IF EXISTS "Enable insert categories" ON public.categories;
DROP POLICY IF EXISTS "Enable update categories" ON public.categories;
DROP POLICY IF EXISTS "Enable delete categories" ON public.categories;

CREATE POLICY "Enable insert categories auth" ON public.categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update categories auth" ON public.categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete categories auth" ON public.categories FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Zabezpieczenie tabeli breeders
DROP POLICY IF EXISTS "Enable insert breeders" ON public.breeders;
DROP POLICY IF EXISTS "Enable update breeders" ON public.breeders;
DROP POLICY IF EXISTS "Enable delete breeders" ON public.breeders;

CREATE POLICY "Enable insert breeders auth" ON public.breeders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update breeders auth" ON public.breeders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete breeders auth" ON public.breeders FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Zabezpieczenie tabeli site_content
DROP POLICY IF EXISTS "Enable insert content" ON public.site_content;
DROP POLICY IF EXISTS "Enable update content" ON public.site_content;
DROP POLICY IF EXISTS "Enable delete content" ON public.site_content;

CREATE POLICY "Enable insert content auth" ON public.site_content FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update content auth" ON public.site_content FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete content auth" ON public.site_content FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Zabezpieczenie tabeli caresheets
DROP POLICY IF EXISTS "Enable insert caresheets" ON public.caresheets;
DROP POLICY IF EXISTS "Enable update caresheets" ON public.caresheets;
DROP POLICY IF EXISTS "Enable delete caresheets" ON public.caresheets;

CREATE POLICY "Enable insert caresheets auth" ON public.caresheets FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update caresheets auth" ON public.caresheets FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete caresheets auth" ON public.caresheets FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Zabezpieczenie wiaderka (Storage Bucket) geckos
DROP POLICY IF EXISTS "Enable upload" ON storage.objects;
DROP POLICY IF EXISTS "Enable update/delete" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete" ON storage.objects;

CREATE POLICY "Enable upload auth" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'geckos' AND auth.role() = 'authenticated');
CREATE POLICY "Enable update auth" ON storage.objects FOR UPDATE USING (bucket_id = 'geckos' AND auth.role() = 'authenticated');
CREATE POLICY "Enable delete auth" ON storage.objects FOR DELETE USING (bucket_id = 'geckos' AND auth.role() = 'authenticated');

-- Upewnij się, że RLS jest aktywowane na wszystkich tabelach
ALTER TABLE public.geckos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breeders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caresheets ENABLE ROW LEVEL SECURITY;
