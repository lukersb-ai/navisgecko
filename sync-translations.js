const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing env vars');
  process.exit(1);
}

async function syncTranslations() {
  const plPath = path.join(process.cwd(), 'messages/pl.json');
  const enPath = path.join(process.cwd(), 'messages/en.json');
  
  const pl = JSON.parse(fs.readFileSync(plPath, 'utf8'));
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

  const url = `${supabaseUrl}/rest/v1/translations`;
  
  const headers = {
    'apikey': serviceRoleKey,
    'Authorization': `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
  };

  console.log('Syncing PL...');
  const plRes = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ id: 'pl', content: pl, updated_at: new Date().toISOString() })
  });
  if (!plRes.ok) console.error('PL Error:', await plRes.text());

  console.log('Syncing EN...');
  const enRes = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ id: 'en', content: en, updated_at: new Date().toISOString() })
  });
  if (!enRes.ok) console.error('EN Error:', await enRes.text());

  console.log('Done.');
}

syncTranslations();
