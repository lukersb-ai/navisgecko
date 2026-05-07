'use server';

import { supabase } from '@/lib/supabase';
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
    const category = cRes.data.find(c => c.id === g.categoryId);
    const isCategoryPrivate = category?.isPrivate === true;
    if (isCategoryPrivate && !isPremiumRevealed) return false;

    // 3. Ochrona oferty Premium
    if (g.isPremium === true && !isPremiumRevealed) return false;

    // 4. Ochrona Tajnej Oferty (standardowej)
    // Jeśli oferta jest Secret, ale NIE Premium, odsłaniamy hasłem standardowym
    if (g.isSecret === true && !isRevealed) return false;

    return true;
  });

  if (!isRevealed) {
    geckos = geckos.map(g => {
      if (g.hidePrice) {
        return { ...g, price: null, priceEur: null };
      }
      return g;
    });
  }

  const finalCategoryIds = Array.from(new Set(geckos.map(g => g.categoryId)));
  const finalCategories = cRes.data.filter(c => finalCategoryIds.includes(c.id) || (c.isPrivate && isPremiumRevealed) || !c.isPrivate);

  return { geckos, categories: finalCategories, isRevealed, isPremiumRevealed };
}

export async function verifyPricePassword(password: string) {
  // Use secure RPC function to check passwords without revealing them to the client
  const [resPrice, resPremium] = await Promise.all([
    supabase.rpc('check_app_setting', { setting_id: 'price_password', input_value: password }),
    supabase.rpc('check_app_setting', { setting_id: 'premium_password', input_value: password })
  ]);
  
  const isCorrectPremium = resPremium.data === true;
  const isCorrectPrice = resPrice.data === true;

  // Fallback to environment variables if DB function fails or doesn't find the setting
  const expectedPrice = process.env.PRICE_PASSWORD || process.env.NEXT_PUBLIC_PRICE_PASSWORD || 'navis';
  const expectedPremium = process.env.PREMIUM_PASSWORD || 'premium-navis';
  
  const cookieStore = await cookies();

  if (isCorrectPremium || password === expectedPremium) {
    cookieStore.set('prices_revealed', 'true', { path: '/' });
    cookieStore.set('premium_revealed', 'true', { path: '/' });
    return true;
  }

  if (isCorrectPrice || password === expectedPrice) {
    cookieStore.set('prices_revealed', 'true', { path: '/' });
    return true;
  }

  // Security delay to slow down brute-force attacks
  await new Promise(resolve => setTimeout(resolve, 1000));
  return false;
}

export async function lockPrices() {
  const cookieStore = await cookies();
  cookieStore.delete('prices_revealed');
  cookieStore.delete('premium_revealed');
  return true;
}
