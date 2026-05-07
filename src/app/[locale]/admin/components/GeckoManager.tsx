'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LoaderCircle, Trash2, Edit, Plus, Upload, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';

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
  const [isPremium, setIsPremium] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

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
    // Combine existing uploaded urls with new ones
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
      isPremium,
      status,
      imageUrls: finalUrls,
      imageUrl: finalUrls.length > 0 ? finalUrls[0] : null 
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
    setIsPremium(g.isPremium || false);
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
    setIsPremium(false);
    setFiles([]);
    setImageUrls([]);
    if (categories.length > 0) setCategoryId(categories[0].id);
  };

  const deleteGecko = async (id: string, storedUrls: string[]) => {
    if (!confirm('Na pewno chcesz usunąć tę ofertę?')) return;
    
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

  const removeNewFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
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
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isAdding ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-earth-dark text-white hover:bg-earth-main'}`}
        >
          {isAdding ? 'Anuluj' : <><Plus className="w-5 h-5"/> Dodaj Ofertę</>}
        </button>
      </div>

      <div className="p-6 md:p-8">
        {loading ? (
          <div className="flex justify-center p-12"><LoaderCircle className="w-8 h-8 animate-spin text-earth-accent" /></div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-earth-beige/10 p-4 rounded-2xl border border-earth-dark/5">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-sm font-bold text-earth-dark/60 whitespace-nowrap">Filtruj gatunek:</span>
                <select 
                  value={filterCategory} 
                  onChange={e => setFilterCategory(e.target.value)}
                  className="bg-white border border-earth-dark/10 p-2 rounded-lg text-sm font-bold focus:outline-none focus:border-earth-accent w-full md:min-w-[200px]"
                >
                  <option value="all">Wszystkie gatunki</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.namePl}</option>)}
                </select>
              </div>
              <div className="text-sm text-earth-dark/40 font-medium">
                Pokazano {geckos.filter(g => filterCategory === 'all' || g.categoryId === filterCategory).length} z {geckos.length} ofert
              </div>
            </div>

            {isAdding && (
              <form onSubmit={handleCreateOrUpdate} className="bg-earth-beige/10 p-8 rounded-3xl border border-earth-dark/5 space-y-8 mb-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-black text-earth-dark uppercase tracking-wider">ID (np. LG-01)</label>
                    <input required value={internalId} onChange={e=>setInternalId(e.target.value)} className="w-full border-2 border-earth-dark/5 p-3 rounded-xl bg-white focus:border-earth-accent focus:outline-none transition-colors shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-black text-earth-dark uppercase tracking-wider">Gatunek</label>
                    <select required value={categoryId} onChange={e=>setCategoryId(e.target.value)} className="w-full border-2 border-earth-dark/5 p-3 rounded-xl bg-white focus:border-earth-accent focus:outline-none transition-colors shadow-sm">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.namePl}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-black text-earth-dark uppercase tracking-wider">Morph (Odmiana)</label>
                    <input required value={morph} onChange={e=>setMorph(e.target.value)} className="w-full border-2 border-earth-dark/5 p-3 rounded-xl bg-white focus:border-earth-accent focus:outline-none transition-colors shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-black text-earth-dark uppercase tracking-wider">Płeć</label>
                    <select value={gender} onChange={e=>setGender(e.target.value)} className="w-full border-2 border-earth-dark/5 p-3 rounded-xl bg-white focus:border-earth-accent focus:outline-none transition-colors shadow-sm">
                      <option value="Male">Samiec</option><option value="Female">Samica</option><option value="Unsexed">Nieokreślona</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-black text-earth-dark uppercase tracking-wider">Waga (g)</label>
                    <input type="number" step="0.1" value={weight} onChange={e=>setWeight(e.target.value)} className="w-full border-2 border-earth-dark/5 p-3 rounded-xl bg-white focus:border-earth-accent focus:outline-none transition-colors shadow-sm" />
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl border-2 border-earth-dark/5 shadow-sm space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                         <label className="block text-xs font-black text-earth-dark/50 uppercase">Cena (PLN)</label>
                         <input type="number" value={price} onChange={e=>setPrice(e.target.value)} className="w-full border-b-2 border-earth-dark/10 p-2 focus:border-earth-accent focus:outline-none transition-colors bg-transparent" />
                       </div>
                       <div className="space-y-1">
                         <label className="block text-xs font-black text-earth-dark/50 uppercase">Cena (EUR)</label>
                         <input type="number" value={priceEur} onChange={e=>setPriceEur(e.target.value)} className="w-full border-b-2 border-earth-dark/10 p-2 focus:border-earth-accent focus:outline-none transition-colors bg-transparent" />
                       </div>
                     </div>
                     
                     <div className="space-y-2 pt-2">
                       <label className="flex items-center gap-3 text-sm font-bold text-earth-dark cursor-pointer group">
                         <input type="checkbox" checked={hidePrice} onChange={e=>setHidePrice(e.target.checked)} className="rounded-lg text-earth-accent focus:ring-earth-accent w-5 h-5 border-2 border-earth-dark/10" />
                         <span className="group-hover:text-earth-accent transition-colors">Ukryj cenę (Zapytaj)</span>
                       </label>
                       <label className="flex items-center gap-3 text-sm font-bold text-earth-dark cursor-pointer group">
                         <input type="checkbox" checked={isHidden} onChange={e=>setIsHidden(e.target.checked)} className="rounded-lg text-earth-accent focus:ring-earth-accent w-5 h-5 border-2 border-earth-dark/10" />
                         <span className="group-hover:text-earth-accent transition-colors">Ukryj gekona na stronie</span>
                       </label>
                       <label className="flex items-center gap-3 text-sm font-bold text-earth-dark cursor-pointer group">
                         <input type="checkbox" checked={isSecret} onChange={e=>setIsSecret(e.target.checked)} className="rounded-lg text-earth-accent focus:ring-earth-accent w-5 h-5 border-2 border-earth-dark/10" />
                         <span className="group-hover:text-earth-accent transition-colors text-earth-accent">Tajna oferta (na hasło)</span>
                       </label>
                       <label className="flex items-center gap-3 text-sm font-bold text-amber-600 cursor-pointer group">
                         <input type="checkbox" checked={isPremium} onChange={e=>setIsPremium(e.target.checked)} className="rounded-lg text-amber-500 focus:ring-amber-500 w-5 h-5 border-2 border-amber-600/20" />
                         <span className="group-hover:text-amber-700 transition-colors">Oferta PREMIUM (osobne hasło)</span>
                       </label>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="block text-sm font-black text-earth-dark uppercase tracking-wider">Status</label>
                     <select value={status} onChange={e=>setStatus(e.target.value)} className={`w-full border-2 border-earth-dark/5 p-3 rounded-xl bg-white focus:border-earth-accent focus:outline-none transition-colors shadow-sm font-black ${status === 'AVAILABLE' ? 'text-green-600' : status === 'RESERVED' ? 'text-orange-500' : 'text-gray-500'}`}>
                      <option value="AVAILABLE">Dostępny</option>
                      <option value="RESERVED">Zarezerwowany</option>
                      <option value="SOLD">Sprzedany</option>
                    </select>
                  </div>

                  <div className="col-span-full space-y-4">
                     <label className="block text-sm font-black text-earth-dark uppercase tracking-wider">Galeria Zdjęć</label>
                     
                     <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative border-4 border-dashed rounded-[2rem] p-10 transition-all duration-300 flex flex-col items-center justify-center gap-4 group ${isDragging ? 'border-earth-accent bg-earth-accent/5 scale-[0.99]' : 'border-earth-dark/10 bg-white hover:border-earth-dark/20'}`}
                     >
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          onChange={handleFileSelect} 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        />
                        <div className={`p-6 rounded-full transition-colors ${isDragging ? 'bg-earth-accent text-white' : 'bg-earth-beige text-earth-dark group-hover:bg-earth-dark group-hover:text-white'}`}>
                          <Upload className="w-10 h-10" />
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-black text-earth-dark">Przeciągnij zdjęcia tutaj</p>
                          <p className="text-earth-dark/50 font-bold">lub kliknij, aby wybrać pliki z dysku</p>
                        </div>
                     </div>

                     {(imageUrls.length > 0 || files.length > 0) && (
                       <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 mt-6">
                         {imageUrls.map((url, i) => (
                           <div key={`old-${i}`} className="relative aspect-square group rounded-2xl overflow-hidden border-2 border-earth-dark/10 shadow-sm">
                             <img src={url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <button type="button" onClick={() => removeOldImage(i)} className="bg-red-500 text-white p-2 rounded-xl hover:bg-red-600 transition-colors shadow-lg">
                                 <Trash2 className="w-5 h-5" />
                               </button>
                             </div>
                             {i === 0 && <div className="absolute top-2 left-2 bg-earth-accent text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md uppercase">Główne</div>}
                           </div>
                         ))}
                         {files.map((file, i) => (
                           <div key={`new-${i}`} className="relative aspect-square group rounded-2xl overflow-hidden border-2 border-earth-accent/30 shadow-sm bg-earth-accent/5">
                             <div className="w-full h-full flex items-center justify-center flex-col p-2 text-center">
                               <Upload className="w-6 h-6 text-earth-accent mb-1" />
                               <span className="text-[10px] font-bold text-earth-accent truncate w-full">{file.name}</span>
                             </div>
                             <div className="absolute inset-0 bg-earth-accent/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <button type="button" onClick={() => removeNewFile(i)} className="bg-red-500 text-white p-2 rounded-xl hover:bg-red-600 transition-colors shadow-lg">
                                 <Trash2 className="w-5 h-5" />
                               </button>
                             </div>
                             <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md uppercase">Nowe</div>
                           </div>
                         ))}
                       </div>
                     )}
                  </div>
                </div>

                <div className="flex justify-end pt-8 border-t border-earth-dark/5">
                  <button type="submit" disabled={uploading} className="bg-earth-accent hover:bg-earth-dark text-white px-10 py-4 rounded-2xl font-black text-xl flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-earth-accent/20 disabled:opacity-50 disabled:pointer-events-none">
                    {uploading ? <LoaderCircle className="w-6 h-6 animate-spin"/> : <Plus className="w-6 h-6"/>}
                    {editingId ? 'Zaktualizuj Ofertę' : 'Dodaj Ofertę'}
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
                  {geckos
                    .filter(g => filterCategory === 'all' || g.categoryId === filterCategory)
                    .sort((a, b) => {
                      const catA = categories.find(c => c.id === a.categoryId)?.namePl || '';
                      const catB = categories.find(c => c.id === b.categoryId)?.namePl || '';
                      return catA.localeCompare(catB);
                    })
                    .map(g => (
                    <tr key={g.id} className={`hover:bg-earth-beige/20 transition-colors ${g.isHidden ? 'opacity-50 grayscale' : ''}`}>
                      <td className="p-4 w-24">
                        {(g.imageUrls && g.imageUrls.length > 0) || g.imageUrl ? (
                           <img src={g.imageUrls?.[0] || g.imageUrl} alt="" className="w-16 h-16 object-cover rounded-lg shadow-sm" />
                        ) : <div className="w-16 h-16 bg-gray-200 rounded-lg shadow-sm"></div>}
                      </td>
                      <td className="p-4">
                        <div className="font-bold">{g.internalId}</div>
                        <div className="flex flex-col gap-1">
                          <div className={`text-sm font-bold ${g.hidePrice ? 'text-earth-accent' : 'text-earth-main'}`}>
                            {g.price ? `${g.price} PLN` : '-'} / {g.priceEur ? `${g.priceEur} EUR` : '-'}
                          </div>
                          {g.hidePrice && (
                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter bg-earth-accent/10 text-earth-accent px-1.5 py-0.5 rounded w-fit border border-earth-accent/20">
                              <EyeOff className="w-2.5 h-2.5" /> Ukryta (Zapytaj)
                            </div>
                          )}
                        </div>
                        {g.isSecret && <div className="mt-1 flex items-center gap-1 text-[10px] uppercase font-black text-earth-dark/40"><Lock className="w-2.5 h-2.5"/> Tajna oferta</div>}
                        {g.isPremium && <div className="mt-0.5 flex items-center gap-1 text-[10px] uppercase font-black text-amber-600"><ShieldCheck className="w-2.5 h-2.5"/> Oferta Premium</div>}
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
