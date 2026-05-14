const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function searchDB() {
  const url = `${supabaseUrl}/rest/v1/translations?select=*`;
  
  const headers = {
    'apikey': serviceRoleKey,
    'Authorization': `Bearer ${serviceRoleKey}`
  };

  const res = await fetch(url, { headers });
  const data = await res.json();
  console.log('All Translations from DB:', JSON.stringify(data, null, 2));
}

searchDB();
