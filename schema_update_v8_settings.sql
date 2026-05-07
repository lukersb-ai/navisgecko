-- Aktualizacja V8 - ZARZĄDZANIE HASŁAMI Z PANELU ADMINA
-- Kopiuj do edytora SQL w Supabase i naciśnij RUN 🚀

CREATE TABLE IF NOT EXISTS public.app_settings (
    id TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wstępne hasła
INSERT INTO public.app_settings (id, value) VALUES 
('price_password', 'navis'),
('premium_password', 'premium-navis')
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read for everyone" ON public.app_settings;
CREATE POLICY "Enable read for everyone" ON public.app_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable update for auth only" ON public.app_settings;
CREATE POLICY "Enable update for auth only" ON public.app_settings FOR UPDATE USING (auth.role() = 'authenticated');
