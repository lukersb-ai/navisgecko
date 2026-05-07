'use server'

import fs from 'fs';
import path from 'path';
import { createSupabaseServerClient } from '@/lib/supabase-server';

/** Returns the current translations from disk. No auth needed (read-only). */
export async function getTranslationsList() {
  try {
    const plPath = path.join(process.cwd(), 'messages/pl.json');
    const enPath = path.join(process.cwd(), 'messages/en.json');
    return {
      pl: JSON.parse(fs.readFileSync(plPath, 'utf8')),
      en: JSON.parse(fs.readFileSync(enPath, 'utf8'))
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}

/** Overwrites translation files. Requires an active admin session. */
export async function saveTranslationsList(plData: unknown, enData: unknown) {
  // ── Auth guard ──────────────────────────────────────────────────────────────
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('saveTranslationsList: unauthorized call rejected');
    return { success: false, error: 'Brak uprawnień.' };
  }
  // ────────────────────────────────────────────────────────────────────────────

  try {
    const plPath = path.join(process.cwd(), 'messages/pl.json');
    const enPath = path.join(process.cwd(), 'messages/en.json');
    fs.writeFileSync(plPath, JSON.stringify(plData, null, 2), 'utf8');
    fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
}
