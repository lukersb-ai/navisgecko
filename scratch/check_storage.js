const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.storage.from('geckos').list();
  if (error) {
    console.error('Error:', error);
    return;
  }
  let totalSize = 0;
  data.forEach(file => {
    if (file.metadata && file.metadata.size) {
      totalSize += file.metadata.size;
    }
  });
  console.log('Total Size in geckos bucket:', (totalSize / (1024 * 1024)).toFixed(2), 'MB');
  console.log('File count:', data.length);
}
check();
