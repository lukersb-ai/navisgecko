'use server';

import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase-server';
import { revalidateSiteAction } from './revalidate';

/**
 * Zapisuje treść sekcji (np. O nas, Kontakt) przy użyciu klucza Admina,
 * co pozwala na ominięcie restrykcji RLS i problemów z UID użytkownika.
 */
export async function updateSiteContentAction(id: string, contentPl: string, contentEn: string) {
  // 1. Sprawdź, czy użytkownik jest zalogowany (bezpieczeństwo)
  const supabaseServer = await createSupabaseServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) {
    return { error: 'Brak uprawnień. Zaloguj się ponownie.' };
  }

  // 2. Inicjalizacja klienta Admina (Service Role)
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return { error: 'Błąd konfiguracji serwera (brak klucza Service Role).' };
  }

  // 3. Upsert danych
  const { error } = await adminClient
    .from('site_content')
    .upsert({
      id,
      content_pl: contentPl,
      content_en: contentEn,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('updateSiteContentAction Error:', error);
    return { error: error.message };
  }

  // 4. Automatyczna rewalidacja strony (żeby zmiany były widoczne u klientów)
  try {
    await revalidateSiteAction();
  } catch (revalidateErr) {
    console.warn('Revalidation failed, but content was saved:', revalidateErr);
  }

  return { success: true };
}
