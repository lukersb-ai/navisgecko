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

export async function getStorageSizeAction() {
  // Auth Guard
  const supabaseServer = await createSupabaseServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) return 0;

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) return 0;

  try {
    const { data: buckets, error: bucketsError } = await adminClient.storage.listBuckets();
    if (bucketsError || !buckets) return 0;

    let totalSize = 0;

    const getFolderSize = async (bucketName: string, path: string = ''): Promise<number> => {
      let total = 0;
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await adminClient.storage.from(bucketName).list(path, { 
          limit: 1000, 
          offset 
        });
        
        if (error || !data || data.length === 0) {
          hasMore = false;
          break;
        }

        for (const item of data) {
          if (!item.id || !item.metadata) { // Folder (item.id is null for folders in list())
            total += await getFolderSize(bucketName, path ? `${path}/${item.name}` : item.name);
          } else {
            total += item.metadata.size || 0;
          }
        }

        if (data.length < 1000) {
          hasMore = false;
        } else {
          offset += 1000;
        }
      }
      return total;
    };

    for (const bucket of buckets) {
      totalSize += await getFolderSize(bucket.name);
    }

    return totalSize;
  } catch (err) {
    console.error('getStorageSizeAction error:', err);
    return 0;
  }
}

export async function deleteGeckoAction(id: string, storedUrls: string[]) {
  // Auth Guard
  const supabaseServer = await createSupabaseServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) return { error: 'Brak uprawnień.' };

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) return { error: 'No admin client' };

  try {
    // 1. Usuń pliki ze storage
    if (storedUrls && storedUrls.length > 0) {
      const filePaths = storedUrls
        .map(url => url?.split('/').pop())
        .filter((path): path is string => !!path);
      
      if (filePaths.length > 0) {
        const { error: storageError } = await adminClient.storage.from('geckos').remove(filePaths);
        if (storageError) {
          console.error('Błąd usuwania plików ze storage:', storageError);
        }
      }
    }

    // 2. Usuń rekord z bazy
    const { error: dbError } = await adminClient.from('geckos').delete().eq('id', id);
    if (dbError) throw dbError;

    revalidatePath('/', 'layout');
    revalidatePath('/[locale]/available', 'page');
    
    return { success: true };
  } catch (err: any) {
    console.error('deleteGeckoAction error:', err);
    return { error: err.message };
  }
}

export async function deleteStorageFileAction(filePath: string) {
  // Auth Guard
  const supabaseServer = await createSupabaseServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) return { error: 'Brak uprawnień.' };

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) return { error: 'No admin client' };

  try {
    const { error } = await adminClient.storage.from('geckos').remove([filePath]);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('deleteStorageFileAction error:', err);
    return { error: err.message };
  }
}

export async function deleteCategoryAction(categoryId: string) {
  // Auth Guard
  const supabaseServer = await createSupabaseServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) return { error: 'Brak uprawnień.' };

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) return { error: 'No admin client' };

  try {
    // 1. Sprawdź czy jest poradnik i czy ma zdjęcie
    const { data: caresheet } = await adminClient
      .from('caresheets')
      .select('image_url')
      .eq('id', categoryId)
      .single();

    if (caresheet?.image_url) {
      const filePath = caresheet.image_url.split('/').pop();
      if (filePath) await adminClient.storage.from('geckos').remove([filePath]);
    }

    // 2. Usuń poradnik
    await adminClient.from('caresheets').delete().eq('id', categoryId);

    // 3. Usuń kategorię
    const { error: catError } = await adminClient.from('categories').delete().eq('id', categoryId);
    if (catError) throw catError;

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    console.error('deleteCategoryAction error:', err);
    return { error: err.message };
  }
}

export async function cleanupOrphanFilesAction() {
  // Auth Guard
  const supabaseServer = await createSupabaseServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) return { error: 'Brak uprawnień.' };

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) return { error: 'No admin client' };

  try {
    // 1. Pobierz wszystkie pliki ze storage (geckos bucket)
    const allFiles: string[] = [];
    const listFiles = async (path: string = '') => {
      let offset = 0;
      let hasMore = true;
      while (hasMore) {
        const { data, error } = await adminClient.storage.from('geckos').list(path, { limit: 1000, offset });
        if (error || !data) break;
        for (const item of data) {
          if (!item.id) { // Folder
            await listFiles(path ? `${path}/${item.name}` : item.name);
          } else {
            allFiles.push(path ? `${path}/${item.name}` : item.name);
          }
        }
        if (data.length < 1000) hasMore = false;
        else offset += 1000;
      }
    };
    await listFiles();

    // 2. Pobierz wszystkie używane URL-e z bazy
    const [geckosRes, breedersRes, caresheetsRes] = await Promise.all([
      adminClient.from('geckos').select('imageUrl, imageUrls'),
      adminClient.from('breeders').select('imageUrl'),
      adminClient.from('caresheets').select('image_url')
    ]);

    const usedFiles = new Set<string>();
    
    const extractFilename = (url: string | null) => {
      if (!url) return null;
      return url.split('/').pop();
    };

    geckosRes.data?.forEach(g => {
      const f1 = extractFilename(g.imageUrl);
      if (f1) usedFiles.add(f1);
      if (Array.isArray(g.imageUrls)) {
        g.imageUrls.forEach((u: string) => {
          const f = extractFilename(u);
          if (f) usedFiles.add(f);
        });
      }
    });

    breedersRes.data?.forEach(b => {
      const f = extractFilename(b.imageUrl);
      if (f) usedFiles.add(f);
    });

    caresheetsRes.data?.forEach(c => {
      const f = extractFilename(c.image_url);
      if (f) usedFiles.add(f);
    });

    // 3. Znajdź sieroty
    const orphans = allFiles.filter(fileName => !usedFiles.has(fileName));

    // 4. Usuń sieroty (partiami po 100)
    let deletedCount = 0;
    if (orphans.length > 0) {
      for (let i = 0; i < orphans.length; i += 100) {
        const chunk = orphans.slice(i, i + 100);
        const { error } = await adminClient.storage.from('geckos').remove(chunk);
        if (!error) deletedCount += chunk.length;
      }
    }

    revalidatePath('/', 'layout');
    return { success: true, deletedCount, orphansFound: orphans.length };
  } catch (err: any) {
    console.error('cleanupOrphanFilesAction error:', err);
    return { error: err.message };
  }
}
