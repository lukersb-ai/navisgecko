import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function syncTranslations() {
  const plPath = path.join(process.cwd(), 'messages/pl.json');
  const enPath = path.join(process.cwd(), 'messages/en.json');
  
  const pl = JSON.parse(fs.readFileSync(plPath, 'utf8'));
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

  console.log('Syncing PL...');
  const { error: plError } = await supabase
    .from('translations')
    .upsert({ id: 'pl', content: pl, updated_at: new Date().toISOString() });

  if (plError) console.error('PL Error:', plError);

  console.log('Syncing EN...');
  const { error: enError } = await supabase
    .from('translations')
    .upsert({ id: 'en', content: en, updated_at: new Date().toISOString() });

  if (enError) console.error('EN Error:', enError);

  console.log('Done.');
}

syncTranslations();
