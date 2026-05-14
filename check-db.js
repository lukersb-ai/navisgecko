const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkTranslations() {
  const url = `${supabaseUrl}/rest/v1/translations?id=eq.pl&select=content`;
  
  const headers = {
    'apikey': serviceRoleKey,
    'Authorization': `Bearer ${serviceRoleKey}`
  };

  const res = await fetch(url, { headers });
  const data = await res.json();
  console.log('DB Content (Caresheets.pageTitle):', data[0]?.content?.Caresheets?.pageTitle);
}

checkTranslations();
