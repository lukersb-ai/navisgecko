-- Aktualizacja V2 - Kopiuj do edytora SQL w Supabase i naciśnij RUN 🚀

-- 1. Tabela na Gatunki (Kategorie) - aby admin mógł dodawać dowolne!
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    "namePl" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public categories view" ON public.categories;
CREATE POLICY "Public categories view" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert categories" ON public.categories;
CREATE POLICY "Enable insert categories" ON public.categories FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update categories" ON public.categories;
CREATE POLICY "Enable update categories" ON public.categories FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete categories" ON public.categories;
CREATE POLICY "Enable delete categories" ON public.categories FOR DELETE USING (true);

-- 2. Tabela Nasza Hodowla (Złota kolekcja Gekonów, niesprzedawalne)
CREATE TABLE IF NOT EXISTS public.breeders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    morph TEXT NOT NULL,
    gender TEXT,
    "categoryId" TEXT DEFAULT 'leopard-gecko',
    "imageUrl" TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.breeders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public breeders view" ON public.breeders;
CREATE POLICY "Public breeders view" ON public.breeders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert breeders" ON public.breeders;
CREATE POLICY "Enable insert breeders" ON public.breeders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update breeders" ON public.breeders;
CREATE POLICY "Enable update breeders" ON public.breeders FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Enable delete breeders" ON public.breeders;
CREATE POLICY "Enable delete breeders" ON public.breeders FOR DELETE USING (true);

-- 3. Rozbudowa istniejącej tabeli Ofert i Treści Stron
ALTER TABLE public.geckos ADD COLUMN IF NOT EXISTS "imageUrls" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.geckos ADD COLUMN IF NOT EXISTS "hidePrice" BOOLEAN DEFAULT false;

-- 4. Wstępne napełnienie (Pre-fill) bazy starymi tekstami, by uniknąć pustek
INSERT INTO public.categories (id, "namePl", "nameEn") VALUES 
('leopard-gecko', 'Gekon Lamparci', 'Leopard Gecko'),
('crested-gecko', 'Gekon Orzęsiony', 'Crested Gecko') 
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.site_content (id, content_pl, content_en) VALUES 
('home_about', '"W naszej hodowli stawiamy na profesjonalizm, pasję połączoną z najwyższą jakością środowiska dla jaszczurek."', '"In our breeding facility, we focus on professionalism."'),
('hero_desc', '"Specjalizujemy się w hodowli wysokiej klasy gekonów lamparcich i orzęsionych. Odkryj stworzenia, które skradną Twoje serce."', '"We specialize in breeding high-class geckos."'),
('contact_info', '"<p>Napisz do nas a z chęcią odpowiemy na każde z Twoich pytań, doradzimy przy wyborze lub zarezerwujemy Twojego przyszłego pupila!</p>"', '"<p>Write to us and we will gladly answer any of your questions!</p>"') 
ON CONFLICT (id) DO NOTHING;

-- Pre-fill Poradników z oryginalnymi ikonami Lucide, żeby przywrócić design!
INSERT INTO public.caresheets (id, "namePl", "nameEn", cards) VALUES
('leopard-gecko', 'Gekon Lamparci', 'Leopard Gecko', '[{"id": "temp", "iconName": "ThermometerSun", "titlePl": "Temperatura i oświetlenie", "titleEn": "Temperature and Lighting", "descPl": "Wymagania cieplne, wyspa ciepła 32-35°C, oraz konieczny cykl dobowy.", "descEn": "Heat requirements, basking spots of 32-35°C, and necessary day/night cycles."}, {"id": "diet", "iconName": "Apple", "titlePl": "Dieta i suplementacja", "titleEn": "Diet and Supplementation", "descPl": "Najlepsze owady karmowe, dobór witamin bez D3 oraz wapń z D3.", "descEn": "Best feeder insects, choosing vitamins without D3 and calcium with D3."}, {"id": "terrarium", "iconName": "Grid", "titlePl": "Terrarium", "titleEn": "Terrarium Setup", "descPl": "Wymiary docelowe, odpowiednie bezstresowe podłoże i bezpieczne kryjówki.", "descEn": "Optimal enclosure size, appropriate stress-free substrate, and secure hides."}, {"id": "handling", "iconName": "HeartHandshake", "titlePl": "Oswajanie", "titleEn": "Handling", "descPl": "Jak skutecznie i pomału budować relacje z gekonem, minimalizując stres.", "descEn": "How to effectively and slowly build trust with your gecko, minimizing stress."}]'::jsonb),
('crested-gecko', 'Gekon Orzęsiony', 'Crested Gecko', '[{"id": "temp", "iconName": "ThermometerSun", "titlePl": "Temperatura i wilgotność", "titleEn": "Temperature and Humidity", "descPl": "Wymagania pokojowe 22-26°C oraz częste zraszanie na poziomie 60-80%.", "descEn": "Room requirements 22-26°C and frequent misting at 60-80% humidity."}, {"id": "diet", "iconName": "Apple", "titlePl": "Dieta w proszku i owady", "titleEn": "Powdered Diet and Insects", "descPl": "Gotowe karmy na bazie papki owocowej Pangea/Repashy i owady karmowe.", "descEn": "Prepared fruit-based powder diets like Pangea/Repashy and feeder insects."}, {"id": "terrarium", "iconName": "TreePine", "titlePl": "Terrarium Wertykalne", "titleEn": "Vertical Terrarium", "descPl": "Terrarium ułożone pionowo z tubami dębu korkowego i roślinami.", "descEn": "Vertically oriented terrarium with cork bark tubes and live plants."}]'::jsonb)
ON CONFLICT (id) DO NOTHING;
