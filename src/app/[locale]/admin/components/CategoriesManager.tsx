'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Save, Trash2, Tags, Plus } from 'lucide-react';

export default function CategoriesManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
    setLoading(false);
  };

  const addCategory = () => {
    setCategories([...categories, { id: '', namePl: '', nameEn: '', isNew: true }]);
  };

  const updateCategory = (index: number, field: string, value: string) => {
    const newCats = [...categories];
    newCats[index][field] = value;
    // Auto-generate ID (slug) from PL name if it's new
    if (newCats[index].isNew && field === 'namePl') {
      newCats[index].id = value.toLowerCase().replace(/ę/g, 'e').replace(/ó/g, 'o').replace(/ą/g, 'a').replace(/ś/g, 's').replace(/ł/g, 'l').replace(/ż/g, 'z').replace(/ź/g, 'z').replace(/ć/g, 'c').replace(/ń/g, 'n').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    }
    setCategories(newCats);
  };

  const saveCategory = async (cat: any) => {
    if (!cat.id || !cat.namePl || !cat.nameEn) return alert('Wypełnij wszystkie pola wiersza!');
    setSaving(true);
    const { error } = await supabase.from('categories').upsert({
      id: cat.id,
      namePl: cat.namePl,
      nameEn: cat.nameEn
    });
    if (error) {
      alert('Błąd: ' + error.message);
    } else {
      if (cat.isNew) {
         // Auto-create tied Caresheet skeleton
         await supabase.from('caresheets').insert([{
            id: cat.id,
            namePl: cat.namePl,
            nameEn: cat.nameEn,
            cards: []
         }]);
      }
      alert('Zapisano kategorię!');
      fetchCategories();
    }
    setSaving(false);
  };

  const deleteCategory = async (id: string, isNew?: boolean) => {
    if (isNew) {
      setCategories(categories.filter(c => c.id !== id));
      return;
    }
    if (!confirm('Czy na pewno chcesz usunąć tę kategorię?')) return;
    
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) fetchCategories();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-earth-dark/5 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-earth-dark/10 bg-earth-beige/20 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Tags className="w-6 h-6 text-earth-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-earth-dark">Zarządzanie Gatunkami</h2>
            <p className="text-earth-dark/60 text-sm">Dodawaj nowe kategorie filtrowania, np. "Agama Brodata".</p>
          </div>
        </div>
        <button onClick={addCategory} className="flex items-center gap-2 bg-earth-dark text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-earth-main">
          <Plus className="w-4 h-4"/> Dodaj Gatunek
        </button>
      </div>

      <div className="p-6 md:p-8">
        {loading ? (
             <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-4 items-end bg-earth-beige/10 p-4 border rounded-xl relative">
                <div className="w-full">
                   <label className="text-xs font-bold uppercase mb-1 block">ID (np. leopard-gecko)</label>
                   <input required disabled={!cat.isNew} value={cat.id} onChange={e=>updateCategory(idx, 'id', e.target.value)} className="w-full border p-2 rounded text-sm bg-gray-50" />
                </div>
                <div className="w-full">
                   <label className="text-xs font-bold uppercase mb-1 block">Nazwa PL</label>
                   <input required value={cat.namePl} onChange={e=>updateCategory(idx, 'namePl', e.target.value)} className="w-full border p-2 rounded text-sm" />
                </div>
                <div className="w-full">
                   <label className="text-xs font-bold uppercase mb-1 block">Nazwa EN</label>
                   <input required value={cat.nameEn} onChange={e=>updateCategory(idx, 'nameEn', e.target.value)} className="w-full border p-2 rounded text-sm" />
                </div>
                <div className="flex gap-2">
                   <button onClick={() => saveCategory(cat)} disabled={saving} className="bg-earth-accent hover:bg-earth-dark text-white p-2.5 rounded-lg font-bold min-w-[100px] flex justify-center">
                     {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Zapisz'}
                   </button>
                   <button onClick={() => deleteCategory(cat.id, cat.isNew)} className="bg-red-100 hover:bg-red-200 text-red-600 p-2.5 rounded-lg flex justify-center">
                     <Trash2 className="w-5 h-5"/>
                   </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && <p className="text-center text-gray-400">Brak gatunków w bazie. Dodaj nowy.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
