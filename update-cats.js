import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ueemyjskkvothwjrxvrv.supabase.co';
const supabaseKey = 'sb_publishable_lb2D6v0iQ0xvbNBHqXktJA_IKSHaZhc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function pluralizeCategories() {
  const { data: cats, error } = await supabase.from('categories').select('*');
  if (error) {
    console.error('Error fetching categories:', error);
    return;
  }
  
  for (const cat of cats) {
    let newPl = cat.namePl;
    if (newPl.toLowerCase().includes('gekon orzęsiony') || newPl.toLowerCase().includes('gekon orzesiony')) {
      newPl = 'Gekony orzęsione';
    } else if (newPl.toLowerCase().includes('gekon lamparci')) {
      newPl = 'Gekony lamparcie';
    } else if (newPl.toLowerCase().startsWith('gekon ')) {
       newPl = newPl.replace(/gekon/i, 'Gekony');
    }

    if (newPl !== cat.namePl) {
      console.log(`Updating category '${cat.namePl}' to '${newPl}'`);
      await supabase.from('categories').update({ namePl: newPl }).eq('id', cat.id);
      await supabase.from('caresheets').update({ namePl: newPl }).eq('id', cat.id);
    }
  }
  console.log('Done!');
}

pluralizeCategories();
