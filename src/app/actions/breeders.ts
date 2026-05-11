'use server';

import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function updateBreederOrderAction(id1: string, order1: number, id2: string, order2: number) {
  // Auth Guard
  const supabaseServer = await createSupabaseServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) return { error: 'Brak uprawnień. Zaloguj się jako administrator.' };

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) return { error: 'No admin client' };

  const { error } = await adminClient.from('breeders').update({ sort_order: order1 }).eq('id', id1);
  const { error: error2 } = await adminClient.from('breeders').update({ sort_order: order2 }).eq('id', id2);

  if (!error && !error2) {
    revalidatePath('/', 'layout');
    return { success: true };
  }

  return { error: error || error2 };
}

export async function reorderAllBreedersAction(updates: { id: string, sort_order: number }[]) {
  // Auth Guard
  const supabaseServer = await createSupabaseServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) return { error: 'Brak uprawnień. Zaloguj się jako administrator.' };

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) return { error: 'No admin client' };

  try {
    await Promise.all(
      updates.map(u => 
        adminClient.from('breeders').update({ sort_order: u.sort_order }).eq('id', u.id)
      )
    );
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
