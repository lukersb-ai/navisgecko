-- Aktualizacja V10 (POPRAWIONA) - OPTYMALIZACJA WYDAJNOŚCI
-- Kopiuj do edytora SQL w Supabase i naciśnij RUN 🚀

-- 1. Indeksy dla jaszczurek
CREATE INDEX IF NOT EXISTS idx_geckos_category_id ON public.geckos("categoryId");
CREATE INDEX IF NOT EXISTS idx_geckos_status ON public.geckos(status);
CREATE INDEX IF NOT EXISTS idx_geckos_flags ON public.geckos("isPremium", "isSecret", "isHidden");
CREATE INDEX IF NOT EXISTS idx_geckos_created_at ON public.geckos(created_at DESC);

-- 2. Indeksy dla kategorii
CREATE INDEX IF NOT EXISTS idx_categories_is_private ON public.categories("isPrivate");

-- 3. Optymalizacja wyszukiwania tekstu w CMS
CREATE INDEX IF NOT EXISTS idx_site_content_id ON public.site_content(id);
