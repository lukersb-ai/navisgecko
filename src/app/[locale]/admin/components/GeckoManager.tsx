'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { LoaderCircle, Trash2, Edit, Plus, Upload, Eye, EyeOff, Lock, ShieldCheck, Wand2, ArrowUp, ArrowDown, RefreshCcw } from 'lucide-react';
import { updateGeckoOrderAction, reorderAllGeckosAction } from '@/app/actions/geckos';
import { compressImage } from '@/lib/image-utils';
import Image from 'next/image';

export default function GeckoManager() {
  const [geckos, setGeckos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);
  const containerRef = useRef<HTMLDivElement>(null);

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
  const [description, setDescription] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isQuickEdit, setIsQuickEdit] = useState(false);
  const [eurRate, setEurRate] = useState(4.30);

  const uniqueMorphs = Array.from(new Set(geckos.map(g => g.morph).filter(Boolean))).sort();

  useEffect(() => {
    setMounted(true);
    fetchData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        fetchData();
      }
    });

    return () => subscription.unsubscribe();
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

  const moveGecko = async (id: string, direction: 'up' | 'down') => {
    const visibleGeckos = geckos.filter(g => filterCategory === 'all' || g.categoryId === filterCategory);
    const index = visibleGeckos.findIndex(g => g.id === id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= visibleGeckos.length) return;

    const current = visibleGeckos[index];
    const target = visibleGeckos[targetIndex];

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

    // Optymistyczna aktualizacja UI (natychmiastowa reakcja)
    setGeckos(prev => {
      const newList = [...prev];
      const idxA = newList.findIndex(g => g.id === current.id);
      const idxB = newList.findIndex(g => g.id === target.id);
      if (idxA !== -1 && idxB !== -1) {
        const tempObj = { ...newList[idxA], sort_order: currentSort };
        newList[idxA] = { ...newList[idxB], sort_order: targetSort };
        newList[idxB] = tempObj;
      }
      return newList;
    });

    const res = await updateGeckoOrderAction(current.id, currentSort, target.id, targetSort);

    if (res.error) {
      alert('Nie udało się zapisać kolejności w bazie.');
      fetchData(); // Cofnij zmiany w UI
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const [geckosRes, catsRes, settingsRes] = await Promise.all([
      supabase.from('geckos').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
      supabase.from('categories').select('*'),
      supabase.from('app_settings').select('*').eq('id', 'eur_rate').single()
    ]);
    if (geckosRes.data) setGeckos(geckosRes.data);
    if (catsRes.data) {
      setCategories(catsRes.data);
      if (catsRes.data.length > 0 && !editingId) setCategoryId(catsRes.data[0].id);
    }
    if (settingsRes.data) {
      setEurRate(parseFloat(settingsRes.data.value) || 4.30);
    }
    setLoading(false);
  };

  const handleResetAndAlignOrder = async () => {
    if (!confirm('Czy na pewno chcesz zresetować i wyrównać kolejność wszystkich ogłoszeń? Zostaną im nadane numery 1, 2, 3... według obecnego widoku.')) return;
    
    setLoading(true);
    const updates = geckos.map((g, i) => ({ id: g.id, sort_order: i + 1 }));
    
    const res = await reorderAllGeckosAction(updates);
    if (res.error) {
      alert('Błąd podczas wyrównywania kolejności: ' + res.error);
    }
    await fetchData();
    setLoading(false);
  };

  const uploadImages = async (): Promise<string[]> => {
    if (files.length === 0) return imageUrls;
    setUploading(true);
    
    const uploadedUrls = [];
    for (const f of files) {
      try {
        const processedFile = await compressImage(f);
        const fileExt = processedFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error } = await supabase.storage.from('geckos').upload(fileName, processedFile);
        if (!error) {
          const { data } = supabase.storage.from('geckos').getPublicUrl(fileName);
          uploadedUrls.push(data.publicUrl);
        }
      } catch (err) {
        console.error('Błąd uploadu:', err);
      }
    }
    setUploading(false);
    return [...imageUrls, ...uploadedUrls];
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
      description,
      description_en: descriptionEn,
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
    setDescription(g.description || '');
    setDescriptionEn(g.description_en || '');
    setImageUrls(g.imageUrls?.length > 0 ? g.imageUrls : (g.imageUrl ? [g.imageUrl] : []));
    setFiles([]);
    
    setTimeout(() => {
      if (containerRef.current) {
        const yOffset = -100; 
        const y = containerRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
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
    setDescription('');
    setDescriptionEn('');
    setFiles([]);
    setImageUrls([]);
    if (categories.length > 0) setCategoryId(categories[0].id);
  };

  const handleQuickUpdate = async (id: string, payload: any) => {
    const { error } = await supabase.from('geckos').update(payload).eq('id', id);
    if (!error) {
      setGeckos(prev => prev.map(item => item.id === id ? { ...item, ...payload } : item));
    }
    return { error };
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
  
  const removeOldImage = async (index: number) => {
    const url = imageUrls[index];
    if (url) {
       const filePath = url.split('/').pop();
       if (filePath) await supabase.storage.from('geckos').remove([filePath]);
    }
    const newUrls = [...imageUrls];
    newUrls.splice(index, 1);
    setImageUrls(newUrls);
    
    // If editing existing gecko, sync DB immediately to avoid broken links
    if (editingId) {
      await supabase.from('geckos').update({ 
        imageUrls: newUrls, 
        imageUrl: newUrls[0] || null 
      }).eq('id', editingId);
      
      // Update local state as well
      setGeckos(prev => prev.map(g => g.id === editingId ? { ...g, imageUrls: newUrls, imageUrl: newUrls[0] || null } : g));
    }
  }

  const removeNewFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  }

  return (
    <div ref={containerRef} className="bg-white rounded-2xl shadow-lg border border-earth-dark/5 overflow-hidden">
      <div className="p-2 md:p-3 border-b border-earth-dark/10 bg-earth-beige/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-earth-dark">Menedżer Ofert</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <button 
            onClick={handleResetAndAlignOrder}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-earth-dark/10 rounded-xl text-xs font-bold text-earth-dark/60 hover:text-earth-dark hover:border-earth-dark/30 transition-all shadow-sm"
            title="Wyrównaj numery kolejności (1, 2, 3...)"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Wyrównaj kolejność
          </button>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-earth-dark/10 shadow-sm">
            <span className="text-[10px] font-black text-earth-dark/40 uppercase tracking-wider">Filtruj:</span>
            <select 
              value={filterCategory} 
              onChange={e => setFilterCategory(e.target.value)}
              className="bg-transparent border-0 text-sm font-bold focus:outline-none focus:ring-0 text-earth-dark cursor-pointer min-w-[140px]"
            >
              <option value="all">Wszystkie gatunki</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.namePl}</option>)}
            </select>
          </div>
          </div>

          <button
            onClick={() => {
              if (isQuickEdit) {
                fetchData(); // Refresh only when closing edit mode
              }
              setIsQuickEdit(!isQuickEdit);
            }}
            className={`flex items-center gap-2 px-4 py-3.5 rounded-xl font-black transition-all text-sm shadow-md ${isQuickEdit ? 'bg-orange-100 text-orange-600' : 'bg-white text-earth-dark border border-earth-dark/10'}`}
          >
            <Edit className="w-4 h-4" />
            {isQuickEdit ? 'Zakończ Edycję' : 'Szybka Edycja'}
          </button>

          <button
            onClick={() => { resetForm(); setIsAdding(!isAdding); }}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-black transition-all text-base shadow-md transform hover:scale-105 active:scale-95 ${isAdding ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-earth-dark text-white hover:bg-earth-main'}`}
          >
            {isAdding ? 'Anuluj' : <><Plus className="w-5 h-5"/> Dodaj Ofertę</>}
          </button>

          {isAdding && (
            <button
              form="gecko-form"
              type="submit"
              disabled={uploading}
              className="flex items-center gap-2 bg-earth-accent hover:bg-orange-500 text-white px-8 py-3.5 rounded-xl font-black transition-all text-base shadow-md transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {editingId ? 'Zaktualizuj' : 'Dodaj'}
              {uploading ? <LoaderCircle className="w-5 h-5 animate-spin"/> : <Plus className="w-5 h-5"/>}
            </button>
          )}
        </div>
      </div>

      <div className="p-6 md:p-8 pt-0">
        {loading ? (
          <div className="flex justify-center p-12"><LoaderCircle className="w-8 h-8 animate-spin text-earth-accent" /></div>
        ) : (
          <div className="space-y-6">

            {isAdding && (
              <form id="gecko-form" onSubmit={handleCreateOrUpdate} className="bg-earth-beige/10 p-6 rounded-3xl border border-earth-dark/5 space-y-6 mb-8 shadow-sm">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Lewa kolumna: Podstawowe dane */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-earth-dark uppercase tracking-wider">ID (np. LG-01)</label>
                        <input required value={internalId} onChange={e=>setInternalId(e.target.value)} className="w-full border-2 border-earth-dark/5 p-2.5 rounded-xl bg-white focus:border-earth-accent focus:outline-none transition-colors shadow-sm text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-earth-dark uppercase tracking-wider">Gatunek</label>
                        <select required value={categoryId} onChange={e=>setCategoryId(e.target.value)} className="w-full border-2 border-earth-dark/5 p-2.5 rounded-xl bg-white focus:border-earth-accent focus:outline-none transition-colors shadow-sm text-sm">
                          {categories.map(c => <option key={c.id} value={c.id}>{c.namePl}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-earth-dark uppercase tracking-wider">Morph (Odmiana)</label>
                        <input list="morph-suggestions" value={morph} onChange={e=>setMorph(e.target.value)} className="w-full border-2 border-earth-dark/5 p-2.5 rounded-xl bg-white focus:border-earth-accent focus:outline-none transition-colors shadow-sm text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-earth-dark uppercase tracking-wider">Płeć</label>
                        <select value={gender} onChange={e=>setGender(e.target.value)} className="w-full border-2 border-earth-dark/5 p-2.5 rounded-xl bg-white focus:border-earth-accent focus:outline-none transition-colors shadow-sm text-sm">
                          <option value="Male">Samiec</option><option value="Female">Samica</option><option value="Unsexed">Nieokreślona</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-earth-dark uppercase tracking-wider">Waga (g)</label>
                        <input type="number" step="0.1" value={weight} onChange={e=>setWeight(e.target.value)} className="w-full border-2 border-earth-dark/5 p-2.5 rounded-xl bg-white focus:border-earth-accent focus:outline-none transition-colors shadow-sm text-sm" />
                      </div>
                      <div className="space-y-1">
                         <label className="block text-[10px] font-black text-earth-dark uppercase tracking-wider">Status</label>
                         <select value={status} onChange={e=>setStatus(e.target.value)} className={`w-full border-2 border-earth-dark/5 p-2.5 rounded-xl bg-white focus:border-earth-accent focus:outline-none transition-colors shadow-sm font-black text-sm ${status === 'AVAILABLE' ? 'text-green-600' : status === 'RESERVED' ? 'text-orange-500' : 'text-gray-500'}`}>
                          <option value="AVAILABLE">Dostępny</option>
                          <option value="RESERVED">Zarezerwowany</option>
                          <option value="SOLD">Sprzedany</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border-2 border-earth-dark/5 shadow-sm space-y-4">
              <div className="flex items-end gap-2">
                <div className="flex-grow">
                  <label className="block text-sm font-bold text-earth-dark mb-2">Cena (PLN)</label>
                  <input 
                    type="number" 
                    value={price} 
                    onChange={e => {
                      setPrice(e.target.value);
                      if (e.target.value && !priceEur) {
                        const raw = parseFloat(e.target.value) / eurRate;
                        const rounded = Math.ceil(raw / 5) * 5;
                        setPriceEur(rounded.toString());
                      }
                    }}
                    className="w-full border-2 border-earth-dark/10 p-4 rounded-2xl bg-white focus:border-earth-accent focus:outline-none transition-all font-bold text-lg"
                    placeholder="np. 1200"
                  />
                </div>
                <div className="flex-grow relative">
                  <label className="block text-sm font-bold text-earth-dark mb-2">Cena (EUR)</label>
                  <input 
                    type="number" 
                    value={priceEur} 
                    onChange={e => setPriceEur(e.target.value)}
                    className="w-full border-2 border-earth-dark/10 p-4 rounded-2xl bg-white focus:border-earth-accent focus:outline-none transition-all font-bold text-lg pr-12"
                    placeholder="np. 280"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      if (price) {
                        const raw = parseFloat(price) / eurRate;
                        const rounded = Math.ceil(raw / 5) * 5;
                        setPriceEur(rounded.toString());
                      }
                    }}
                    className="absolute right-3 bottom-3 p-2 bg-earth-accent hover:bg-orange-600 text-white rounded-lg shadow-md transition-all active:scale-95"
                    title="Przelicz z PLN"
                  >
                    <Wand2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
                       
                       <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
                         <label className="flex items-center gap-2 text-xs font-bold text-earth-dark cursor-pointer group">
                           <input type="checkbox" checked={hidePrice} onChange={e=>setHidePrice(e.target.checked)} className="rounded text-earth-accent focus:ring-earth-accent w-4 h-4 border-2 border-earth-dark/10" />
                           <span className="group-hover:text-earth-accent transition-colors">Ukryj cenę</span>
                         </label>
                         <label className="flex items-center gap-2 text-xs font-bold text-earth-dark cursor-pointer group">
                           <input type="checkbox" checked={isHidden} onChange={e=>setIsHidden(e.target.checked)} className="rounded text-earth-accent focus:ring-earth-accent w-4 h-4 border-2 border-earth-dark/10" />
                           <span className="group-hover:text-earth-accent transition-colors">Ukryj na stronie</span>
                         </label>
                         <label className="flex items-center gap-2 text-xs font-bold text-earth-dark cursor-pointer group">
                           <input type="checkbox" checked={isSecret} onChange={e=>setIsSecret(e.target.checked)} className="rounded text-earth-accent focus:ring-earth-accent w-4 h-4 border-2 border-earth-dark/10" />
                           <span className="group-hover:text-earth-accent transition-colors text-earth-accent">Tajna (na hasło)</span>
                         </label>
                         <label className="flex items-center gap-2 text-xs font-bold text-amber-600 cursor-pointer group">
                           <input type="checkbox" checked={isPremium} onChange={e=>setIsPremium(e.target.checked)} className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4 border-2 border-amber-600/20" />
                           <span className="group-hover:text-amber-700 transition-colors">PREMIUM</span>
                         </label>
                       </div>
                       <div className="space-y-1 pt-4">
                         <label className="block text-[10px] font-black text-earth-dark uppercase tracking-wider">Notatka / Opis (PL)</label>
                         <textarea 
                           value={description} 
                           onChange={e=>setDescription(e.target.value)} 
                           placeholder="np. Je mrożonki, spokojny charakter..."
                           className="w-full border-2 border-earth-dark/5 p-2.5 rounded-xl bg-white focus:border-earth-accent focus:outline-none transition-colors shadow-sm text-sm h-20 resize-none" 
                         />
                       </div>
                       <div className="space-y-1 pt-2">
                         <label className="block text-[10px] font-black text-earth-dark uppercase tracking-wider">Note / Description (EN)</label>
                         <textarea 
                           value={descriptionEn} 
                           onChange={e=>setDescriptionEn(e.target.value)} 
                           placeholder="e.g. Eats frozen food, calm temperament..."
                           className="w-full border-2 border-earth-dark/5 p-2.5 rounded-xl bg-white focus:border-earth-accent focus:outline-none transition-colors shadow-sm text-sm h-20 resize-none" 
                         />
                       </div>
                    </div>
                  </div>

                  {/* Prawa kolumna: Galeria */}
                  <div className="space-y-4">
                     <label className="block text-[10px] font-black text-earth-dark uppercase tracking-wider">Galeria Zdjęć</label>
                     
                     <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-2xl p-4 transition-all duration-300 flex flex-col items-center justify-center gap-2 group min-h-[120px] ${isDragging ? 'border-earth-accent bg-earth-accent/5' : 'border-earth-dark/10 bg-white hover:border-earth-dark/20'}`}
                     >
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          onChange={handleFileSelect} 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        />
                        <Upload className={`w-6 h-6 transition-colors ${isDragging ? 'text-earth-accent' : 'text-earth-dark/30 group-hover:text-earth-accent'}`} />
                        <div className="text-center">
                          <p className="text-sm font-black text-earth-dark">Przeciągnij zdjęcia lub kliknij</p>
                        </div>
                      </div>

                     {(imageUrls.length > 0 || files.length > 0) && (
                       <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6 gap-2 mt-2 max-h-[180px] overflow-y-auto p-1">
                         {imageUrls.map((url, i) => (
                           <div key={`old-${i}`} className="relative aspect-square group rounded-lg overflow-hidden border border-earth-dark/10 shadow-sm">
                             <img src={url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <button type="button" onClick={() => removeOldImage(i)} className="bg-red-500 text-white p-1 rounded-md hover:bg-red-600 transition-colors">
                                 <Trash2 className="w-3.5 h-3.5" />
                               </button>
                             </div>
                             {i === 0 && <div className="absolute top-1 left-1 bg-earth-accent text-white text-[8px] font-black px-1 py-0.5 rounded shadow-md uppercase">Główne</div>}
                           </div>
                         ))}
                         {files.map((file, i) => (
                           <div key={`new-${i}`} className="relative aspect-square group rounded-lg overflow-hidden border border-earth-accent/30 shadow-sm bg-earth-accent/5">
                             <div className="w-full h-full flex items-center justify-center flex-col p-1 text-center">
                               <Upload className="w-4 h-4 text-earth-accent mb-0.5" />
                               <span className="text-[8px] font-bold text-earth-accent truncate w-full">{file.name}</span>
                             </div>
                             <div className="absolute inset-0 bg-earth-accent/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <button type="button" onClick={() => removeNewFile(i)} className="bg-red-500 text-white p-1 rounded-md hover:bg-red-600 transition-colors">
                                 <Trash2 className="w-3.5 h-3.5" />
                               </button>
                             </div>
                             <div className="absolute top-1 left-1 bg-blue-500 text-white text-[8px] font-black px-1 py-0.5 rounded shadow-md uppercase">Nowe</div>
                           </div>
                         ))}
                       </div>
                     )}
                  </div>
                </div>

              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left bg-white border border-earth-dark/10 rounded-xl overflow-hidden">
                <thead className="bg-earth-beige/50 text-earth-dark text-sm uppercase">
                  <tr>
                    <th className="p-4 w-40 text-center">Zdj.</th>
                    <th className="p-4 w-20 text-center">Kolejność</th>
                    <th className="p-4 w-24">ID</th>
                    <th className="p-4">Morph & Gatunek</th>
                    <th className="p-4 w-32 text-center">Płeć / Waga</th>
                    <th className="p-4 w-40 text-center">Status</th>
                    <th className="p-4 w-44">Cena</th>
                    <th className="p-4 w-36 text-right">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-dark/5">
                  {geckos
                    .filter(g => filterCategory === 'all' || g.categoryId === filterCategory)
                    .slice(0, visibleCount)
                    .map(g => (
                    <tr key={g.id} className={`hover:bg-earth-beige/20 transition-colors ${g.isHidden ? 'opacity-50 grayscale' : ''}`}>
                      {/* 1. Zdjecie */}
                      <td className="p-4">
                        <div className="flex justify-center">
                          {(g.imageUrls && g.imageUrls.length > 0) || g.imageUrl ? (
                             <div className="relative w-32 h-32">
                               <Image 
                                 src={g.imageUrls?.[0] || g.imageUrl} 
                                 alt="" 
                                 fill
                                 sizes="128px"
                                 className="object-cover rounded-2xl shadow-md border border-earth-dark/10" 
                               />
                             </div>
                          ) : <div className="w-32 h-32 bg-gray-100 rounded-2xl shadow-inner flex items-center justify-center text-gray-400 text-xs">Brak</div>}
                        </div>
                      </td>

                      {/* 1.5 Kolejność (Strzałki) */}
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button 
                            type="button"
                            onClick={() => moveGecko(g.id, 'up')}
                            className="p-1 hover:bg-earth-beige rounded transition-colors text-earth-dark/40 hover:text-earth-accent"
                            title="Przesuń w górę"
                          >
                            <ArrowUp className="w-5 h-5" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => moveGecko(g.id, 'down')}
                            className="p-1 hover:bg-earth-beige rounded transition-colors text-earth-dark/40 hover:text-earth-accent"
                            title="Przesuń w dół"
                          >
                            <ArrowDown className="w-5 h-5" />
                          </button>
                        </div>
                      </td>

                      {/* 2. ID */}
                      <td className="p-4">
                        <div className="font-black text-earth-dark text-base tracking-tight">{g.internalId}</div>
                        <div className="flex flex-col gap-0.5 mt-1">
                          {g.isSecret && <div className="flex items-center gap-1 text-[9px] uppercase font-black text-earth-dark/40 border border-earth-dark/10 px-1 rounded w-fit bg-white"><Lock className="w-2 h-2"/> Tajna</div>}
                          {g.isPremium && <div className="flex items-center gap-1 text-[9px] uppercase font-black text-amber-600 border border-amber-200 px-1 rounded w-fit bg-amber-50"><ShieldCheck className="w-2 h-2"/> Prem.</div>}
                        </div>
                      </td>
                      {/* 3. Morph */}
                      <td className="p-4">
                        {isQuickEdit ? (
                          <div className="flex flex-col gap-1">
                            <input 
                              type="text" 
                              list="morph-suggestions"
                              defaultValue={g.morph} 
                              onBlur={async (e) => {
                                const val = e.target.value;
                                if (val !== g.morph) {
                                  handleQuickUpdate(g.id, { morph: val });
                                }
                              }}
                              className="w-full bg-white/50 border border-earth-dark/10 rounded px-2 py-1.5 focus:border-earth-accent outline-none text-lg font-semibold text-earth-dark"
                              placeholder="Morph..."
                            />
                            <div className="text-[11px] text-earth-dark/40 mt-1 font-bold tracking-wide">{categories.find(c => c.id === g.categoryId)?.namePl || g.categoryId}</div>
                          </div>
                        ) : (
                          <>
                            <div className="font-bold text-earth-dark text-lg leading-tight">{g.morph}</div>
                            <div className="text-[11px] text-earth-dark/40 mt-1 uppercase font-bold tracking-widest">{categories.find(c => c.id === g.categoryId)?.namePl || g.categoryId}</div>
                          </>
                        )}
                        {g.description && !isQuickEdit && (
                          <div className="mt-2 text-[10px] text-earth-dark/40 italic line-clamp-1 hover:line-clamp-none cursor-default max-w-[180px]">
                            {g.description}
                          </div>
                        )}
                      </td>

                      {/* 4. Płeć / Waga */}
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className={`text-[13px] font-black uppercase px-3 py-1 rounded-full w-fit shadow-sm ${g.gender === 'Male' ? 'bg-blue-50 text-blue-600 border border-blue-100' : g.gender === 'Female' ? 'bg-pink-50 text-pink-600 border border-pink-100' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                            {g.gender === 'Male' ? 'Samiec' : g.gender === 'Female' ? 'Samica' : 'N/S'}
                          </span>
                          {isQuickEdit ? (
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                step="0.1"
                                defaultValue={g.weight} 
                                onBlur={async (e) => {
                                  const val = e.target.value ? parseFloat(e.target.value) : null;
                                  if (val !== g.weight) {
                                    handleQuickUpdate(g.id, { weight: val });
                                  }
                                }}
                                className="w-16 bg-white/50 border border-earth-dark/10 rounded px-2 py-1 focus:border-earth-accent outline-none text-sm font-mono font-bold text-center"
                                placeholder="0"
                              />
                              <span className="text-[10px] font-bold text-earth-dark/30">g</span>
                            </div>
                          ) : (
                            <span className="text-sm font-mono font-bold text-earth-dark/70 bg-white/20 px-2 py-0.5 rounded">{g.weight && g.weight !== 0 ? `${g.weight}g` : '-'}</span>
                          )}
                        </div>
                      </td>

                      {/* 5. Status */}
                      <td className="p-4 text-center">
                         <select 
                           value={g.status}
                           onChange={async e => {
                             const newStatus = e.target.value;
                             await supabase.from('geckos').update({ status: newStatus }).eq('id', g.id);
                             setGeckos(prev => prev.map(item => item.id === g.id ? { ...item, status: newStatus } : item));
                           }}
                           className={`p-2.5 rounded-xl font-black text-xs uppercase border-2 shadow-sm transition-all focus:ring-0 bg-white ${g.status === 'AVAILABLE' ? 'text-green-600 border-green-200' : g.status === 'RESERVED' ? 'text-orange-600 border-orange-200' : 'text-gray-500 border-gray-200'}`}
                         >
                           <option value="AVAILABLE">Dostępny</option>
                           <option value="RESERVED">Rezerwacja</option>
                           <option value="SOLD">Sprzedany</option>
                         </select>
                      </td>

                      {/* 6. Cena */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          {isQuickEdit ? (
                             <>
                               <div className="flex items-center gap-1 group/price relative">
                                <input 
                                  id={`pln-input-${g.id}`}
                                  type="number" 
                                  defaultValue={g.price} 
                                  onBlur={async (e) => {
                                    const val = e.target.value ? parseFloat(e.target.value) : null;
                                    if (val !== g.price) {
                                      handleQuickUpdate(g.id, { price: val });
                                    }
                                  }}
                                  className="w-24 bg-white/50 border border-earth-dark/10 rounded px-2 py-1 focus:border-earth-accent outline-none text-xs font-bold"
                                  placeholder="PLN"
                                />
                                <span className="text-[10px] text-earth-dark/30 font-bold">PLN</span>
                                
                                <button 
                                  type="button"
                                  onClick={async () => {
                                    const plnInput = document.getElementById(`pln-input-${g.id}`) as HTMLInputElement;
                                    const eurInput = document.getElementById(`eur-input-${g.id}`) as HTMLInputElement;
                                    const pVal = plnInput?.value ? parseFloat(plnInput.value) : null;
                                    const eVal = eurInput?.value ? parseFloat(eurInput.value) : null;

                                    let activeRate = eurRate || 4.30;
                                    if (!eurRate || eurRate === 4.30) {
                                      const { data } = await supabase.from('app_settings').select('value').eq('id', 'eur_rate').maybeSingle();
                                      if (data?.value) activeRate = parseFloat(data.value) || 4.30;
                                    }

                                    if (pVal) {
                                      const rounded = Math.ceil((pVal / activeRate) / 5) * 5;
                                      handleQuickUpdate(g.id, { price: pVal, priceEur: rounded });
                                      if (eurInput) eurInput.value = rounded.toString();
                                    } else if (eVal) {
                                      const roundedPln = Math.round((eVal * activeRate) / 10) * 10;
                                      handleQuickUpdate(g.id, { price: roundedPln, priceEur: eVal });
                                      if (plnInput) plnInput.value = roundedPln.toString();
                                    }
                                  }}
                                  className="p-1.5 bg-earth-accent text-white rounded-md hover:bg-orange-600 transition-all shadow-sm ml-1"
                                  title="Przelicz ceny (PLN <-> EUR)"
                                >
                                  <Wand2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex items-center gap-1">
                                <input 
                                  id={`eur-input-${g.id}`}
                                  type="number" 
                                  defaultValue={g.priceEur} 
                                  onBlur={async (e) => {
                                    const val = e.target.value ? parseFloat(e.target.value) : null;
                                    if (val !== g.priceEur) {
                                      handleQuickUpdate(g.id, { priceEur: val });
                                    }
                                  }}
                                  className="w-24 bg-white/50 border border-earth-dark/10 rounded px-2 py-1 focus:border-earth-accent outline-none text-xs font-bold"
                                  placeholder="EUR"
                                />
                                <span className="text-[10px] text-earth-dark/30 font-bold">EUR</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col">
                              <div className="text-sm font-black text-earth-main">{g.price ? `${g.price} PLN` : '-'}</div>
                              <div className="text-xs font-bold text-earth-dark/40">{g.priceEur ? `${g.priceEur} EUR` : '-'}</div>
                            </div>
                          )}

                          {g.hidePrice && (
                            <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tight bg-earth-accent/10 text-earth-accent px-2 py-0.5 rounded-full w-fit border border-earth-accent/20 mt-1">
                              <EyeOff className="w-2.5 h-2.5" /> Ukryta
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 7. Akcje */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                           <button type="button" onClick={async () => { 
                             const newHidden = !g.isHidden;
                             await supabase.from('geckos').update({ isHidden: newHidden }).eq('id', g.id); 
                             setGeckos(prev => prev.map(item => item.id === g.id ? { ...item, isHidden: newHidden } : item));
                           }} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors shadow-sm" title={g.isHidden ? "Pokaż na stronie" : "Ukryj na stronie"}>
                             {g.isHidden ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                           </button>
                           <button type="button" onClick={() => editGecko(g)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"><Edit className="w-4 h-4"/></button>
                           <button type="button" onClick={() => deleteGecko(g.id, g.imageUrls || [g.imageUrl])} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors shadow-sm"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {geckos.filter(g => filterCategory === 'all' || g.categoryId === filterCategory).length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500 font-bold">
                        Brak ofert dla tej kategorii.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              {visibleCount < geckos.filter(g => filterCategory === 'all' || g.categoryId === filterCategory).length && (
                <button 
                  onClick={() => setVisibleCount(prev => prev + 20)}
                  className="px-8 py-3 bg-earth-dark text-earth-beige rounded-xl font-bold hover:bg-earth-main transition-all shadow-md flex items-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Pokaż więcej ({geckos.filter(g => filterCategory === 'all' || g.categoryId === filterCategory).length - visibleCount})
                </button>
              )}
              {visibleCount > 15 && (
                <button 
                  onClick={() => setVisibleCount(15)}
                  className="px-8 py-3 bg-white border border-earth-dark/10 text-earth-dark/60 rounded-xl font-bold hover:bg-earth-beige/20 transition-all shadow-sm"
                >
                  Pokaż mniej
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {mounted && (
        <datalist id="morph-suggestions">
          {uniqueMorphs.map(m => (
            <option key={m as string} value={m as string} />
          ))}
        </datalist>
      )}
    </div>
  );
}
