'use server';

import { supabase } from '@/lib/supabase';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { revalidatePath, unstable_noStore as noStore, unstable_cache } from 'next/cache';

const getCachedRawGeckos = unstable_cache(
  async () => {
    const adminClient = createSupabaseAdminClient();
    const client = adminClient || supabase;

    const [gRes, cRes] = await Promise.all([
      client.from('geckos').select('id, internalId, morph, gender, weight, birthDate, price, priceEur, hidePrice, isHidden, isSecret, isPremium, imageUrl, categoryId, status, description, created_at, sort_order').eq('isHidden', false).order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
      client.from('categories').select('id, namePl, nameEn, isPrivate')
    ]);

    return { rawGeckos: gRes.data || [], rawCategories: cRes.data || [] };
  },
  ['raw-geckos-db'],
  { tags: ['geckos', 'categories'], revalidate: 3600 }
);

export async function getGeckosAction() {
  noStore();
  const cookieStore = await cookies();
  const isRevealed = cookieStore.get('prices_revealed')?.value === 'true';
  const isPremiumRevealed = cookieStore.get('premium_revealed')?.value === 'true';

  const { rawGeckos, rawCategories } = await getCachedRawGeckos();

  if (!rawGeckos || !rawCategories) return { geckos: [], categories: rawCategories || [], isRevealed, isPremiumRevealed };

  let geckos = rawGeckos.filter((g: any) => {
    // 1. Ukryte całkowicie
    if (g.isHidden) return false;

    // 2. Ochrona kategorii Premium/Private
    const category = rawCategories.find((c: any) => c.id === g.categoryId);
    const isCategoryPrivate = category?.isPrivate === true;
    if (isCategoryPrivate && !isPremiumRevealed) return false;

    // 3. Ochrona oferty Premium
    if (g.isPremium === true && !isPremiumRevealed) return false;

    // 4. Ochrona Tajnej Oferty (standardowej)
    if (g.isSecret === true && !isRevealed) return false;

    return true;
  });

  if (!isRevealed) {
    geckos = geckos.map((g: any) => {
      if (g.hidePrice) {
        return { ...g, price: null, priceEur: null };
      }
      return g;
    });
  }

  const finalCategoryIds = Array.from(new Set(geckos.map((g: any) => g.categoryId)));
  const finalCategories = rawCategories.filter((c: any) => finalCategoryIds.includes(c.id));

  return { geckos, categories: finalCategories, isRevealed, isPremiumRevealed };
}

export async function verifyPricePassword(password: string) {
  // Try to use Admin client (service role) to bypass RLS, 
  // falling back to standard client if SERVICE_ROLE_KEY is missing.
  const adminClient = createSupabaseAdminClient();
  const client = adminClient || supabase;

  const [resPrice, resPremium] = await Promise.all([
    client.rpc('check_app_setting', { setting_id: 'price_password', input_value: password }),
    client.rpc('check_app_setting', { setting_id: 'premium_password', input_value: password })
  ]);

  // Removed debug log for password check

  const isCorrectPremium = resPremium.data === true && !resPremium.error;
  const isCorrectPrice   = resPrice.data  === true && !resPrice.error;

  // Security delay to slow down brute-force attacks (even for parallel requests this adds cost)
  await new Promise(resolve => setTimeout(resolve, 800));

  const cookieStore = await cookies();

  if (isCorrectPremium) {
    cookieStore.set('prices_revealed',  'true', { path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    cookieStore.set('premium_revealed', 'true', { path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    return true;
  }

  if (isCorrectPrice) {
    cookieStore.set('prices_revealed', 'true', { path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    return true;
  }

  return false;
}

export async function lockPrices() {
  const cookieStore = await cookies();
  cookieStore.delete('prices_revealed');
  cookieStore.delete('premium_revealed');
  return true;
}

export async function updateGeckoOrderAction(id1: string, order1: number, id2: string, order2: number) {
  // Auth Guard
  const supabaseServer = await createSupabaseServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) return { error: 'Brak uprawnień. Zaloguj się jako administrator.' };

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) return { error: 'No admin client' };

  const { error } = await adminClient.from('geckos').update({ sort_order: order1 }).eq('id', id1);
  const { error: error2 } = await adminClient.from('geckos').update({ sort_order: order2 }).eq('id', id2);

  if (!error && !error2) {
    revalidatePath('/', 'layout'); 
    revalidatePath('/[locale]/available', 'page');
    return { success: true };
  }

  return { error: error || error2 };
}

export async function reorderAllGeckosAction(updates: { id: string, sort_order: number }[]) {
  // Auth Guard
  const supabaseServer = await createSupabaseServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) return { error: 'Brak uprawnień. Zaloguj się jako administrator.' };

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) return { error: 'No admin client' };

  // Wykonujemy aktualizacje w pętli (Supabase nie ma bulk update dla różnych wartości w jednym zapytaniu bez RPC)
  // Ale możemy użyć Promise.all
  try {
    await Promise.all(
      updates.map(u => 
        adminClient.from('geckos').update({ sort_order: u.sort_order }).eq('id', u.id)
      )
    );
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
