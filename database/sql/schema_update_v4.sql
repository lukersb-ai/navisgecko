-- Wklej poniższy kod do edytora SQL (SQL Editor) w panelu Supabase i kliknij "Run"

-- Dodanie kolumny isHidden do tabeli gekonów
ALTER TABLE public.geckos ADD COLUMN IF NOT EXISTS "isHidden" BOOLEAN DEFAULT false;
