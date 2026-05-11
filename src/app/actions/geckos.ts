'use server';

import { supabase } from '@/lib/supabase';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

export async function getGeckosAction() {
  const cookieStore = await cookies();
  const isRevealed = cookieStore.get('prices_revealed')?.value === 'true';

  const [gRes, cRes] = await Promise.all([
    supabase.from('geckos').select('id, internalId, morph, gender, weight, birthDate, price, priceEur, hidePrice, isHidden, isSecret, isPremium, imageUrl, categoryId, status, description, created_at').eq('isHidden', false).order('created_at', { ascending: false }),
    supabase.from('categories').select('id, namePl, nameEn, isPrivate')
  ]);

  const isPremiumRevealed = cookieStore.get('premium_revealed')?.value === 'true';

  if (!gRes.data || !cRes.data) return { geckos: [], categories: cRes.data || [], isRevealed, isPremiumRevealed };

  let geckos = gRes.data.filter((g: any) => {
    // 1. Ukryte całkowicie
    if (g.isHidden) return false;

    // 2. Ochrona kategorii Premium/Private
    const category = cRes.data.find((c: any) => c.id === g.categoryId);
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
  const finalCategories = cRes.data.filter((c: any) => finalCategoryIds.includes(c.id));

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
