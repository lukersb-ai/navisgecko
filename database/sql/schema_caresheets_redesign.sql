-- Dodanie nowych kolumn do tabeli caresheets dla nowego designu poradników
ALTER TABLE public.caresheets
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS difficulty TEXT,
ADD COLUMN IF NOT EXISTS temp_range TEXT,
ADD COLUMN IF NOT EXISTS humidity_range TEXT,
ADD COLUMN IF NOT EXISTS lifespan TEXT;

-- Opcjonalnie: ustawienie domyślnych wartości dla istniejących rekordów
UPDATE public.caresheets SET difficulty = 'Łatwy / Początkujący' WHERE difficulty IS NULL;
UPDATE public.caresheets SET temp_range = '22-26°C' WHERE temp_range IS NULL;
UPDATE public.caresheets SET humidity_range = '60-80%' WHERE humidity_range IS NULL;
UPDATE public.caresheets SET lifespan = '15+ lat' WHERE lifespan IS NULL;
