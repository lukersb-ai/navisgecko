'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase-server';

/**
 * Triggers on-demand revalidation of all public pages.
 * Can only be called from admin components – the Supabase session
 * is verified server-side so no secret token needs to be exposed to the client.
 */
export async function revalidateSiteAction(): Promise<{ success: boolean; error?: string }> {
  // Auth guard – only logged-in admins may trigger revalidation
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('revalidateSiteAction: unauthorized call rejected');
    return { success: false, error: 'Brak uprawnień.' };
  }

  revalidatePath('/pl');
  revalidatePath('/en');
  revalidatePath('/pl/contact');
  revalidatePath('/en/contact');

  return { success: true };
}
