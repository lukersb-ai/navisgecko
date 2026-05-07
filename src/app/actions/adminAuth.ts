'use server';

import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function loginAction() {
  // Verify that a real Supabase session exists before issuing our cookie.
  // This prevents anyone from calling this Server Action directly without
  // first completing the Supabase auth flow.
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { success: false, error: 'Brak aktywnej sesji.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin_auth', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });
  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_auth');
  return { success: true };
}
