'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Trash2, Edit, Plus, Upload, Eye, EyeOff, Lock } from 'lucide-react';

export default function GeckoManager() {
  const [geckos, setGeckos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [internalId, setInternalId] = useState('');
  const [categoryId, setCategoryId] = useState('leopard-gecko');
  const [morph, setMorph] = useState('');
  const [gender, setGender] = useState('Male');
  const [status, setStatus] = useState('AVAILABLE');
  const [weight, setWeight] = useState('');
  const [price, setPrice] = useState('');
  const [priceEur, setPriceEur] = useState('');
  const [hidePrice, setHidePrice] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isSecret, setIsSecret] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [geckosRes, catsRes] = await Promise.all([
      supabase.from('geckos').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*')
    ]);
    if (geckosRes.data) setGeckos(geckosRes.data);
    if (catsRes.data) {
      setCategories(catsRes.data);
      if (catsRes.data.length > 0 && !editingId) setCategoryId(catsRes.data[0].id);
    }
    setLoading(false);
  };

  const uploadImages = async () => {
    if (files.length === 0) return [];
    setUploading(true);
    const urls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error } = await supabase.storage.from('geckos').upload(fileName, file);
      if (!error) {
        const { data } = supabase.storage.from('geckos').getPublicUrl(fileName);
        urls.push(data.publicUrl);
      }
    }
    setUploading(false);
    return urls;
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUrls = await uploadImages();
    // Combine existing uploaded urls with new ones (limit logic can be applied if needed)
    // For simplicity, if they select files, we append them. Or if it's new, we just use them.
    const finalUrls = (imageUrls || []).concat(newUrls);

    const payload = {
      internalId,
      categoryId,
      morph,
      gender,
      weight: weight ? parseFloat(weight) : null,
      price: price ? parseFloat(price) : null,
      priceEur: priceEur ? parseFloat(priceEur) : null,
      hidePrice,
      isHidden,
      isSecret,
      status,
      imageUrls: finalUrls,
      imageUrl: finalUrls.length > 0 ? finalUrls[0] : null // Fallback for backward compatibility
    };

    let error;
    if (editingId) {
      const res = await supabase.from('geckos').update(payload).eq('id', editingId);
      error = res.error;
    } else {
      const res = await supabase.from('geckos').insert([payload]);
      error = res.error;
    }

    if (error) {
      alert('Błąd: ' + error.message);
    } else {
      resetForm();
      fetchData();
    }
  };

  const editGecko = (g: any) => {
    setIsAdding(true);
    setEditingId(g.id);
    setInternalId(g.internalId);
    setCategoryId(g.categoryId || 'leopard-gecko');
    setMorph(g.morph);
    setGender(g.gender);
    setStatus(g.status || 'AVAILABLE');
    setWeight(g.weight?.toString() || '');
    setPrice(g.price?.toString() || '');
    setPriceEur(g.priceEur?.toString() || '');
    setHidePrice(g.hidePrice || false);
    setIsHidden(g.isHidden || false);
    setIsSecret(g.isSecret || false);
    // Backward compatibility for old records that only had imageUrl
    setImageUrls(g.imageUrls?.length > 0 ? g.imageUrls : (g.imageUrl ? [g.imageUrl] : []));
    setFiles([]);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setInternalId('');
    setMorph('');
    setWeight('');
    setPrice('');
    setPriceEur('');
    setHidePrice(false);
    setIsHidden(false);
    setIsSecret(false);
    setFiles([]);
    setImageUrls([]);
    if (categories.length > 0) setCategoryId(categories[0].id);
  };

  const deleteGecko = async (id: string, storedUrls: string[]) => {
    if (!confirm('Na pewno chchcesz usunąć tego gekona?')) return;
    
    // Attempt removing images from storage silently
    if (storedUrls && storedUrls.length > 0) {
       for (const url of storedUrls) {
          const filePath = url.split('/').pop();
          if (filePath) await supabase.storage.from('geckos').remove([filePath]);
       }
    }

    await supabase.from('geckos').delete().eq('id', id);
    fetchData();
  };
  
  const removeOldImage = (index: number) => {
    const newUrls = [...imageUrls];
    newUrls.splice(index, 1);
    setImageUrls(newUrls);
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-earth-dark/5 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-earth-dark/10 bg-earth-beige/20 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-earth-dark">Menedżer Ofert Sklepowych</h2>
          <p className="text-earth-dark/60 text-sm">Zarządzaj gekonami wystawionymi na sprzedaż.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsAdding(!isAdding); }}
          className="flex items-center gap-2 bg-earth-dark text-white px-4 py-2 rounded-xl font-bold hover:bg-earth-main"
        >
          {isAdding ? 'Anuluj' : <><Plus className="w-4 h-4"/> Dodaj Ofertę</>}
        </button>
      </div>

      <div className="p-6 md:p-8">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : (
          <div className="space-y-8">
            {isAdding && (
              <form onSubmit={handleCreateOrUpdate} className="bg-earth-beige/20 p-6 rounded-xl border border-earth-dark/10 space-y-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div><label className="block text-sm font-bold mb-1">ID (np. LG-01)</label><input required value={internalId} onChange={e=>setInternalId(e.target.value)} className="w-full border p-2 rounded bg-white shadow-sm" /></div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Gatunek</label>
                    <select required value={categoryId} onChange={e=>setCategoryId(e.target.value)} className="w-full border p-2 rounded bg-white shadow-sm">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.namePl}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-sm font-bold mb-1">Morph (Odmiana)</label><input required value={morph} onChange={e=>setMorph(e.target.value)} className="w-full border p-2 rounded bg-white shadow-sm" /></div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Płeć</label>
                    <select value={gender} onChange={e=>setGender(e.target.value)} className="w-full border p-2 rounded bg-white shadow-sm">
                      <option value="Male">Samiec</option><option value="Female">Samica</option><option value="Unsexed">Nieokreślona</option>
                    </select>
                  </div>
                  <div><label className="block text-sm font-bold mb-1">Waga (g)</label><input type="number" step="0.1" value={weight} onChange={e=>setWeight(e.target.value)} className="w-full border p-2 rounded bg-white shadow-sm" /></div>
                  
                  <div className="bg-white p-3 rounded border border-earth-dark/10 shadow-sm relative">
                     <label className="block text-sm font-bold mb-1">Cena (PLN)</label>
                     <input type="number" value={price} onChange={e=>setPrice(e.target.value)} className="w-full border p-2 rounded bg-gray-50 mb-2" />
                     <label className="block text-sm font-bold mb-1">Cena (EUR)</label>
                     <input type="number" value={priceEur} onChange={e=>setPriceEur(e.target.value)} className="w-full border p-2 rounded bg-gray-50 mb-2" />
                     
                     <label className="flex items-center gap-2 text-xs font-medium text-earth-dark cursor-pointer select-none mt-2 border-t pt-2 border-earth-dark/10">
                       <input type="checkbox" checked={hidePrice} onChange={e=>setHidePrice(e.target.checked)} className="rounded text-earth-accent focus:ring-earth-accent w-4 h-4" />
                       Ukryj cenę (Pokaż "Zapytaj")
                     </label>
                     <label className="flex items-center gap-2 text-xs font-medium text-earth-dark cursor-pointer select-none mt-2">
                       <input type="checkbox" checked={isHidden} onChange={e=>setIsHidden(e.target.checked)} className="rounded text-earth-accent focus:ring-earth-accent w-4 h-4" />
                       Ukryj całkowicie gekona na stronie
                     </label>
                     <label className="flex items-center gap-2 text-xs font-medium text-earth-dark cursor-pointer select-none mt-2">
                       <input type="checkbox" checked={isSecret} onChange={e=>setIsSecret(e.target.checked)} className="rounded text-earth-accent focus:ring-earth-accent w-4 h-4" />
                       Tajna oferta (widoczna po podaniu hasła na stronie)
                     </label>
                  </div>

                  <div>
                     <label className="block text-sm font-bold mb-1">Status</label>
                     <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full border p-2 rounded bg-white shadow-sm font-semibold">
                      <option value="AVAILABLE" className="text-green-700">Dostępny</option>
                      <option value="RESERVED" className="text-orange-500">Zarezerwowany</option>
                      <option value="SOLD" className="text-gray-500">Sprzedany</option>
                    </select>
                  </div>

                  <div className="col-span-full border-t border-earth-dark/10 pt-4">
                     <label className="block text-sm font-bold mb-2">Zdjęcia (Wiele na raz)</label>
                     {imageUrls.length > 0 && (
                       <div className="flex flex-wrap gap-2 mb-4">
                         {imageUrls.map((url, i) => (
                           <div key={i} className="relative group">
                             <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-300" />
                             <button type="button" onClick={() => removeOldImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                               <Trash2 className="w-3 h-3" />
                             </button>
                           </div>
                         ))}
                       </div>
                     )}
                     <input type="file" multiple accept="image/*" onChange={e => setFiles(Array.from(e.target.files || []))} className="w-full text-sm bg-white p-2 rounded border border-dashed border-gray-400" />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button type="submit" disabled={uploading} className="bg-earth-accent hover:bg-earth-dark text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2">
                    {uploading && <Loader2 className="w-4 h-4 animate-spin"/>} {editingId ? 'Zaktualizuj Ofertę' : 'Dodaj Ofertę'}
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left bg-white border border-earth-dark/10 rounded-xl overflow-hidden">
                <thead className="bg-earth-beige/50 text-earth-dark text-sm uppercase">
                  <tr>
                    <th className="p-4">Zdjęcie</th>
                    <th className="p-4">ID & Cena</th>
                    <th className="p-4">Morph & Gatunek</th>
                    <th className="p-4">Płeć/Waga</th>
                    <th className="p-4">Zmień Status</th>
                    <th className="p-4">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-dark/5">
                  {geckos.map(g => (
                    <tr key={g.id} className={`hover:bg-earth-beige/20 transition-colors ${g.isHidden ? 'opacity-50 grayscale' : ''}`}>
                      <td className="p-4 w-24">
                        {(g.imageUrls && g.imageUrls.length > 0) || g.imageUrl ? (
                           <img src={g.imageUrls?.[0] || g.imageUrl} alt="" className="w-16 h-16 object-cover rounded-lg shadow-sm" />
                        ) : <div className="w-16 h-16 bg-gray-200 rounded-lg shadow-sm"></div>}
                      </td>
                      <td className="p-4">
                        <div className="font-bold">{g.internalId}</div>
                        <div className={`mt-1 font-bold ${g.hidePrice ? 'text-gray-400 line-through' : 'text-earth-main'}`}>
                          {g.price ? `${g.price} PLN` : '-'} / {g.priceEur ? `${g.priceEur} EUR` : '-'}
                        </div>
                        {g.isSecret && <div className="mt-1 flex items-center gap-1 text-xs text-earth-accent font-bold"><Lock className="w-3 h-3"/> Tajna oferta</div>}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-earth-dark">{g.morph}</div>
                        <div className="text-xs text-earth-dark/50 mt-0.5">{categories.find(c => c.id === g.categoryId)?.namePl || g.categoryId}</div>
                      </td>
                      <td className="p-4 text-earth-dark/80">{g.gender} <br/><span className="text-xs font-mono">{g.weight}g</span></td>
                      <td className="p-4">
                         <select 
                           value={g.status}
                           onChange={async e => {
                             await supabase.from('geckos').update({ status: e.target.value }).eq('id', g.id);
                             fetchData();
                           }}
                           className={`p-2 rounded font-bold text-sm border-0 shadow-sm ${g.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : g.status === 'RESERVED' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}
                         >
                           <option value="AVAILABLE">Dostępny</option>
                           <option value="RESERVED">Rezerwacja</option>
                           <option value="SOLD">Sprzedany</option>
                         </select>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           <button type="button" onClick={async () => { await supabase.from('geckos').update({ isHidden: !g.isHidden }).eq('id', g.id); fetchData(); }} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors" title={g.isHidden ? "Pokaż na stronie" : "Ukryj na stronie"}>
                             {g.isHidden ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                           </button>
                           <button type="button" onClick={() => editGecko(g)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"><Edit className="w-4 h-4"/></button>
                           <button type="button" onClick={() => deleteGecko(g.id, g.imageUrls || [g.imageUrl])} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {geckos.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-500">Brak ofert w systemie, dodaj pierwszego gekona.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
