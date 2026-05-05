'use server';

import { cookies } from 'next/headers';

export async function loginAction() {
  const cookieStore = await cookies();
  cookieStore.set('admin_auth', 'authenticated', { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
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
