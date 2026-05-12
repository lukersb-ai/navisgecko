'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { LoaderCircle, Trash2, Plus, Edit, Image as ImageIcon, ArrowUp, ArrowDown, RefreshCcw } from 'lucide-react';
import { updateBreederOrderAction, reorderAllBreedersAction } from '@/app/actions/breeders';
import { compressImage } from '@/lib/image-utils';
import Image from 'next/image';

export default function BreedersManager() {
  const [breeders, setBreeders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('Zdjęcie w Galerii');
  const [categoryId, setCategoryId] = useState('leopard-gecko');
  const [morph, setMorph] = useState('-');
  const [gender, setGender] = useState('Male');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [breedersRes, catsRes] = await Promise.all([
      supabase.from('breeders').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
      supabase.from('categories').select('*')
    ]);
    if (breedersRes.data) setBreeders(breedersRes.data);
    if (catsRes.data) {
      setCategories(catsRes.data);
      if (catsRes.data.length > 0 && !editingId) setCategoryId(catsRes.data[0].id);
    }
    setLoading(false);
  };

  const uploadImage = async () => {
    if (!file) return imageUrl;
    setUploading(true);
    
    try {
      const processedFile = await compressImage(file);
      const fileExt = processedFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('geckos').upload(fileName, processedFile);
      
      if (uploadError) {
        console.error('Błąd uploadu:', uploadError);
        setUploading(false);
        return imageUrl;
      }
      
      const { data } = supabase.storage.from('geckos').getPublicUrl(fileName);
      setUploading(false);
      return data.publicUrl;
    } catch (err) {
      console.error('Błąd uploadu:', err);
      setUploading(false);
      return imageUrl;
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If we have a new file, upload it and delete the old one
    let finalImageUrl = imageUrl;
    if (file) {
       // Delete old image if it exists
       if (imageUrl) {
         const oldPath = imageUrl.split('/').pop();
         if (oldPath) await supabase.storage.from('geckos').remove([oldPath]);
       }
       finalImageUrl = await uploadImage();
    }

    const payload = {
      name,
      categoryId,
      morph,
      gender,
      description,
      imageUrl: finalImageUrl,
    };

    let error;
    if (editingId) {
       const res = await supabase.from('breeders').update(payload).eq('id', editingId);
       error = res.error;
    } else {
       const res = await supabase.from('breeders').insert([payload]);
       error = res.error;
    }

    if (error) {
       alert('Błąd: ' + error.message);
    } else {
       resetForm();
       fetchData();
    }
  };

  const moveBreeder = async (id: string, direction: 'up' | 'down') => {
    const index = breeders.findIndex(b => b.id === id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= breeders.length) return;

    const current = breeders[index];
    const target = breeders[targetIndex];

    let currentSort = current.sort_order || 0;
    let targetSort = target.sort_order || 0;

    if (currentSort === targetSort) {
      if (direction === 'up') currentSort = targetSort - 1;
      else currentSort = targetSort + 1;
    } else {
      const temp = currentSort;
      currentSort = targetSort;
      targetSort = temp;
    }

    // Optymistyczna aktualizacja UI
    setBreeders(prev => {
      const newList = [...prev];
      const idxA = newList.findIndex(b => b.id === current.id);
      const idxB = newList.findIndex(b => b.id === target.id);
      if (idxA !== -1 && idxB !== -1) {
        const tempObj = { ...newList[idxA], sort_order: currentSort };
        newList[idxA] = { ...newList[idxB], sort_order: targetSort };
        newList[idxB] = tempObj;
      }
      return newList;
    });

    const res = await updateBreederOrderAction(current.id, currentSort, target.id, targetSort);
    if (res.error) {
      alert('Błąd podczas zmiany kolejności');
      fetchData();
    }
  };

  const handleResetAndAlignOrder = async () => {
    if (!confirm('Czy na pewno chcesz zresetować i wyrównać kolejność wszystkich zdjęć w galerii?')) return;
    setLoading(true);
    const updates = breeders.map((b, i) => ({ id: b.id, sort_order: i + 1 }));
    const res = await reorderAllBreedersAction(updates);
    if (res.error) alert('Błąd: ' + res.error);
    await fetchData();
    setLoading(false);
  };

  const editBreeder = (b: any) => {
    setIsAdding(true);
    setEditingId(b.id);
    setName(b.name);
    setCategoryId(b.categoryId);
    setMorph(b.morph);
    setGender(b.gender);
    setDescription(b.description || '');
    setImageUrl(b.imageUrl || '');
    setFile(null);
    
    setTimeout(() => {
      if (containerRef.current) {
        const yOffset = -100; 
        const y = containerRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  const deleteBreeder = async (id: string, storedUrl: string) => {
    if (!confirm('Na pewno usunąć tego zwierzaka hodowlanego?')) return;
    
    // Delete image from storage
    if (storedUrl) {
      const filePath = storedUrl.split('/').pop();
      if (filePath) await supabase.storage.from('geckos').remove([filePath]);
    }

    const { error } = await supabase.from('breeders').delete().eq('id', id);
    if (!error) fetchData();
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setName('Zdjęcie w Galerii');
    setMorph('-');
    setDescription('');
    setImageUrl('');
    setFile(null);
    if (categories.length > 0) setCategoryId(categories[0].id);
  };

  return (
    <div ref={containerRef} className="bg-white rounded-2xl shadow-lg border border-earth-dark/5 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-earth-dark/10 bg-earth-beige/20 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <ImageIcon className="w-6 h-6 text-earth-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-earth-dark">Nasza Hodowla (Złota Kolekcja)</h2>
            <p className="text-earth-dark/60 text-sm">Zarządzaj gekonami pokazowymi, niesprzedawalnymi.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleResetAndAlignOrder}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-earth-dark/10 rounded-xl text-xs font-bold text-earth-dark/60 hover:text-earth-dark hover:border-earth-dark/30 transition-all shadow-sm"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Wyrównaj kolejność
          </button>
          <button 
            onClick={() => { resetForm(); setIsAdding(!isAdding); }} 
            className="flex items-center gap-2 bg-earth-dark text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-earth-main"
          >
            {isAdding ? 'Anuluj' : <><Plus className="w-4 h-4"/> Dodaj Zwierzaka</>}
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {loading ? (
             <div className="flex justify-center"><LoaderCircle className="w-8 h-8 animate-spin" /></div>
        ) : (
          <div className="space-y-8">
            {isAdding && (
              <form onSubmit={handleCreateOrUpdate} className="bg-earth-beige/20 p-6 rounded-xl border border-earth-dark/10 space-y-4 mb-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Gatunek</label>
                      <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full border p-2 rounded bg-white">
                        {categories.map(c => <option key={c.id} value={c.id}>{c.namePl}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Obrazek do podmiany (Opcjonalnie)</label>
                      <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full text-sm" />
                    </div>
                    <div className="col-span-full">
                       <label className="block text-sm font-medium mb-1">Zwięzły opis z charakterem</label>
                       <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border p-2 rounded h-20" />
                    </div>
                 </div>
                 <div className="flex justify-end pt-4">
                    <button type="submit" disabled={uploading} className="bg-earth-accent hover:bg-earth-dark text-white px-8 py-2 rounded-xl font-bold flex items-center gap-2">
                      {uploading && <LoaderCircle className="w-4 h-4 animate-spin"/>} Zapisz
                    </button>
                 </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left bg-white border border-earth-dark/10 rounded-xl overflow-hidden">
                <thead className="bg-earth-beige/50 text-earth-dark text-sm uppercase">
                  <tr>
                    <th className="p-4 w-32">Zdjęcie</th>
                    <th className="p-4 w-20 text-center">Kol.</th>
                    <th className="p-4">Gatunek</th>
                    <th className="p-4 text-right">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-dark/5">
                  {breeders.map(b => (
                    <tr key={b.id} className="hover:bg-earth-beige/20 transition-colors">
                      <td className="p-4 w-40">
                        {b.imageUrl ? (
                          <div className="relative w-32 h-32">
                            <Image 
                              src={b.imageUrl} 
                              alt="" 
                              fill
                              sizes="128px"
                              className="object-cover rounded-lg shadow-md border border-earth-dark/10" 
                            />
                          </div>
                        ) : (
                          <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button 
                            type="button"
                            onClick={() => moveBreeder(b.id, 'up')}
                            className="p-1 hover:bg-earth-beige rounded transition-colors text-earth-dark/40 hover:text-earth-accent"
                          >
                            <ArrowUp className="w-5 h-5" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => moveBreeder(b.id, 'down')}
                            className="p-1 hover:bg-earth-beige rounded transition-colors text-earth-dark/40 hover:text-earth-accent"
                          >
                            <ArrowDown className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-earth-dark">
                         <div className="text-sm">{categories.find(c => c.id === b.categoryId)?.namePl || b.categoryId}</div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button 
                            type="button"
                            onClick={() => moveBreeder(b.id, 'up')}
                            className="p-1 hover:bg-earth-beige rounded transition-colors text-earth-dark/40 hover:text-earth-accent"
                          >
                            <ArrowUp className="w-5 h-5" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => moveBreeder(b.id, 'down')}
                            className="p-1 hover:bg-earth-beige rounded transition-colors text-earth-dark/40 hover:text-earth-accent"
                          >
                            <ArrowDown className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           <button onClick={() => editBreeder(b)} className="p-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"><Edit className="w-4 h-4"/></button>
                           <button onClick={() => deleteBreeder(b.id, b.imageUrl)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {breeders.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">Brak zwierząt w systemie</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
