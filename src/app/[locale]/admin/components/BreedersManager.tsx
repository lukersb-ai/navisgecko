'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LoaderCircle, Trash2, Plus, Edit, Image as ImageIcon } from 'lucide-react';

export default function BreedersManager() {
  const [breeders, setBreeders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
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
      supabase.from('breeders').select('*').order('created_at', { ascending: false }),
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
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('geckos').upload(fileName, file);
    if (uploadError) {
      alert('Błąd wgrywania: ' + uploadError.message);
      setUploading(false);
      return '';
    }
    const { data } = supabase.storage.from('geckos').getPublicUrl(fileName);
    setUploading(false);
    return data.publicUrl;
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const uploadedUrl = await uploadImage();
    const finalImageUrl = uploadedUrl || imageUrl;

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
  };

  const deleteBreeder = async (id: string) => {
    if (!confirm('Na pewno usunąć tego zwierzaka hodowlanego?')) return;
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
    <div className="bg-white rounded-2xl shadow-lg border border-earth-dark/5 overflow-hidden">
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
        <button 
          onClick={() => { resetForm(); setIsAdding(!isAdding); }} 
          className="flex items-center gap-2 bg-earth-dark text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-earth-main"
        >
          {isAdding ? 'Anuluj' : <><Plus className="w-4 h-4"/> Dodaj Zwierzaka</>}
        </button>
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
                    <th className="p-4">Zdjęcie</th>
                    <th className="p-4">Gatunek</th>
                    <th className="p-4">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-dark/5">
                  {breeders.map(b => (
                    <tr key={b.id} className="hover:bg-earth-beige/20 transition-colors">
                      <td className="p-4 w-24">
                        {b.imageUrl ? <img src={b.imageUrl} alt="" className="w-16 h-16 object-cover rounded-lg" /> : <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>}
                      </td>
                      <td className="p-4 font-bold text-earth-dark">
                         <div className="text-sm">{categories.find(c => c.id === b.categoryId)?.namePl || b.categoryId}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           <button onClick={() => editBreeder(b)} className="p-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"><Edit className="w-4 h-4"/></button>
                           <button onClick={() => deleteBreeder(b.id)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 className="w-4 h-4"/></button>
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
