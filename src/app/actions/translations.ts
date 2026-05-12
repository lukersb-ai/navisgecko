'use server'

import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase-server';
import { unstable_cache, revalidateTag } from 'next/cache';
import fs from 'fs';
import path from 'path';

/**
 * ZBUFOROWANE pobieranie tłumaczeń z bazy danych.
 * Dzięki temu nie odpytujemy bazy przy każdym odświeżeniu strony przez klienta.
 */
const getCachedTranslationsFromDB = unstable_cache(
  async (locale: string) => {
    const adminClient = createSupabaseAdminClient();
    if (!adminClient) return null;

    const { data } = await adminClient
      .from('translations')
      .select('content')
      .eq('id', locale)
      .single();

    return data?.content || null;
  },
  ['app-translations'],
  { tags: ['translations'], revalidate: 3600 }
);

/** 
 * Zwraca tłumaczenia. Jeśli nie ma ich w bazie, próbuje wczytać z plików 
 * i zapisać do bazy (automatyczna migracja).
 */
export async function getTranslationsList() {
  try {
    const adminClient = createSupabaseAdminClient();
    if (!adminClient) throw new Error('No admin client');

    // Pobierz z bazy
    const { data: dbData } = await adminClient.from('translations').select('*');
    
    let pl = dbData?.find(d => d.id === 'pl')?.content;
    let en = dbData?.find(d => d.id === 'en')?.content;

    // Fallback do plików (jeśli baza jest pusta)
    if (!pl || !en) {
      const plPath = path.join(process.cwd(), 'messages/pl.json');
      const enPath = path.join(process.cwd(), 'messages/en.json');
      const filePl = JSON.parse(fs.readFileSync(plPath, 'utf8'));
      const fileEn = JSON.parse(fs.readFileSync(enPath, 'utf8'));
      
      if (!pl) pl = filePl;
      if (!en) en = fileEn;

      // Opcjonalnie: Zapisz do bazy, żeby zainicjalizować
      await adminClient.from('translations').upsert([
        { id: 'pl', content: pl },
        { id: 'en', content: en }
      ]);
    }

    return { pl, en };
  } catch (err) {
    console.error('getTranslationsList error:', err);
    return null;
  }
}

/** Zapisuje tłumaczenia do bazy danych. Wymaga sesji admina. */
export async function saveTranslationsList(plData: unknown, enData: unknown) {
  // 1. Auth guard
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Brak uprawnień.' };

  try {
    const adminClient = createSupabaseAdminClient();
    if (!adminClient) throw new Error('Missing Service Role Key');

    // 2. Zapisz do bazy danych
    const { error } = await adminClient
      .from('translations')
      .upsert([
        { id: 'pl', content: plData, updated_at: new Date().toISOString() },
        { id: 'en', content: enData, updated_at: new Date().toISOString() }
      ]);

    if (error) throw error;

    // 3. Wyczyść Cache, żeby zmiany były widoczne od razu
    revalidateTag('translations');

    return { success: true };
  } catch (err) {
    console.error('saveTranslationsList error:', err);
    return { success: false };
  }
}

/** Funkcja używana przez next-intl w i18n/request.ts */
export async function getMessagesForLocale(locale: string) {
  return await getCachedTranslationsFromDB(locale);
}
