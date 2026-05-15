
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
  realtime: { enabled: false }
});

async function checkStorage() {
  console.log('Checking storage buckets...');
  const { data: buckets, error: bError } = await supabase.storage.listBuckets();
  if (bError) {
    console.error('Error listing buckets:', bError);
    return;
  }

  for (const bucket of buckets) {
    console.log(`\nBucket: ${bucket.name}`);
    const { data: files, error: fError } = await supabase.storage.from(bucket.name).list('', { limit: 100 });
    if (fError) {
      console.error(`Error listing files in ${bucket.name}:`, fError);
      continue;
    }

    files.forEach(file => {
      if (file.id) {
        const sizeMB = (file.metadata.size / (1024 * 1024)).toFixed(2);
        console.log(` - ${file.name} (${file.metadata.mimetype}) - ${sizeMB} MB`);
      } else {
        console.log(` - [Folder] ${file.name}`);
      }
    });
  }
}

checkStorage();
