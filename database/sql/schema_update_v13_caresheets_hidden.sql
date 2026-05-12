-- Dodanie opcji ukrywania poradnika
ALTER TABLE public.caresheets
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;
