'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function getGeckosAction() {
  const cookieStore = await cookies();
  const isRevealed = cookieStore.get('prices_revealed')?.value === 'true';

  const [gRes, cRes] = await Promise.all([
    supabase.from('geckos').select('*').order('created_at', { ascending: false }),
    supabase.from('categories').select('*')
  ]);

  if (!gRes.data) return { geckos: [], categories: cRes.data || [], isRevealed };

  let geckos = gRes.data.filter((g: any) => g.isHidden !== true);

  if (!isRevealed) {
    geckos = geckos.filter(g => !g.isSecret);
    geckos = geckos.map(g => {
      if (g.hidePrice) {
        // Usuwamy ceny z ładunku (payloadu) wysyłanego do przeglądarki klienta
        return { ...g, price: null, priceEur: null };
      }
      return g;
    });
  }

  return { geckos, categories: cRes.data || [], isRevealed };
}

export async function verifyPricePassword(password: string) {
  // Sprawdzamy hasło bezpiecznie po stronie serwera
  const expected = process.env.PRICE_PASSWORD || process.env.NEXT_PUBLIC_PRICE_PASSWORD || 'navis';
  if (password === expected) {
    const cookieStore = await cookies();
    cookieStore.set('prices_revealed', 'true', { path: '/' });
    return true;
  }
  return false;
}

export async function lockPrices() {
  const cookieStore = await cookies();
  cookieStore.delete('prices_revealed');
  return true;
}
