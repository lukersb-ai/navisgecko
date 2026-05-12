-- Wklej poniższy kod do edytora SQL (SQL Editor) w panelu Supabase i kliknij "Run"

-- 1. Tworzenie tabeli dla Gekonów
CREATE TABLE public.geckos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "internalId" TEXT NOT NULL,
    "morph" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "weight" NUMERIC,
    "birthDate" DATE,
    "status" TEXT DEFAULT 'AVAILABLE',
    "imageUrl" TEXT,
    "description" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Zezwolenie na publiczny odczyt (żeby każdy widział gekony na stronie)
ALTER TABLE public.geckos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public geckos are viewable by everyone." ON public.geckos FOR SELECT USING (true);

-- Instrukcja: Aby zarządzać rekordami poprzez kod jako Ty (Admin), musimy wyłączyć RLS, lub ufać backendowi (zrobimy to dla uproszczenia by od razu pisać do bazy za pomocą kluczy anon, ale generalnie to ty decydujesz). 
-- Dla 100% łatwości używania wyłączyłem tymczasowo blokady RLS na zapis - Ty będziesz się chronił hasłem na samej podstronie Admina!
CREATE POLICY "Enable insert for everyone" ON public.geckos FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for everyone" ON public.geckos FOR UPDATE USING (true);
CREATE POLICY "Enable delete for everyone" ON public.geckos FOR DELETE USING (true);

-- 2. Stworzenie tzw. "Storage Bucket" (wiadro na pliki do przechowywania wgrywanych zdjęć gekonów)
insert into storage.buckets (id, name, public) values ('geckos', 'geckos', true);
create policy "Public Access" on storage.objects for select using ( bucket_id = 'geckos' );
create policy "Enable upload" on storage.objects for insert with check ( bucket_id = 'geckos' );
create policy "Enable update/delete" on storage.objects for update using ( bucket_id = 'geckos' );
create policy "Enable delete" on storage.objects for delete using ( bucket_id = 'geckos' );
