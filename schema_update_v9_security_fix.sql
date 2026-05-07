-- Aktualizacja V9 - ŁATANIE LUKI BEZPIECZEŃSTWA (Hasła w RLS)
-- Kopiuj do edytora SQL w Supabase i naciśnij RUN 🚀

-- 1. Zabezpieczamy tabelę tak, aby NIKT publicznie nie mógł podejrzeć haseł
ALTER TABLE public.app_settings DISABLE ROW LEVEL SECURITY; -- Reset
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read for everyone" ON public.app_settings;
-- Teraz tylko zalogowany admin widzi hasła w panelu
CREATE POLICY "Admin can read settings" ON public.app_settings FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Tworzymy bezpieczną funkcję do weryfikacji haseł po stronie bazy danych
-- Funkcja jest typu SECURITY DEFINER, co oznacza, że ma dostęp do tabeli nawet gdy RLS ją blokuje,
-- ale użytkownik zewnętrzny widzi tylko wynik (true/false), a nie samo hasło.
CREATE OR REPLACE FUNCTION check_app_setting(setting_id TEXT, input_value TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.app_settings 
        WHERE id = setting_id AND value = input_value
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pozwalamy każdemu (nawet niezalogowanemu) wywołać tę funkcję
GRANT EXECUTE ON FUNCTION check_app_setting(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION check_app_setting(TEXT, TEXT) TO authenticated;
