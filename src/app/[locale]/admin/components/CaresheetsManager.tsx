'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LoaderCircle, Plus, Trash2, Save, FileText, Image as ImageIcon } from 'lucide-react';
import { compressImage } from '@/lib/image-utils';
import TiptapEditor from './TiptapEditor';
import { revalidateSiteAction } from '@/app/actions/revalidate';
import Image from 'next/image';

export default function CaresheetsManager() {
  const [caresheets, setCaresheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSpecies, setActiveSpecies] = useState('leopard-gecko');
  const [saving, setSaving] = useState(false);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  // Form State
  const [namePl, setNamePl] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descPl, setDescPl] = useState('');
  const [descEn, setDescEn] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [difficulty, setDifficulty] = useState('Łatwy / Początkujący');
  const [tempRange, setTempRange] = useState('22-26°C');
  const [humidityRange, setHumidityRange] = useState('60-80%');
  const [lifespan, setLifespan] = useState('15+ lat');
  const [cards, setCards] = useState<any[]>([]);
  const [isHidden, setIsHidden] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function initOptions() {
      const { data } = await supabase.from('categories').select('id, namePl').order('id');
      if (data && data.length > 0) {
         setCategoriesList(data);
         // If current active is not in list, auto-select first one to avoid empty fetches
         if (!data.find(d => d.id === activeSpecies)) {
             setActiveSpecies(data[0].id);
         }
      }
    }
    initOptions();
  }, []);

  useEffect(() => {
    if (activeSpecies) fetchCaresheets();
  }, [activeSpecies]);

  const fetchCaresheets = async () => {
    setLoading(true);
    const { data } = await supabase.from('caresheets').select('*').eq('id', activeSpecies).single();
    if (data) {
      setNamePl(data.namePl || '');
      setNameEn(data.nameEn || '');
      setDescPl(data.descriptionPl || '');
      setDescEn(data.descriptionEn || '');
      setImageUrl(data.image_url || '');
      setDifficulty(data.difficulty || 'Łatwy / Początkujący');
      setTempRange(data.temp_range || '22-26°C');
      setHumidityRange(data.humidity_range || '60-80%');
      setLifespan(data.lifespan || '15+ lat');
      setIsHidden(data.is_hidden || false);
      setCards(data.cards || []);
      setFile(null);
    } else {
      // Default to empty if totally new
      setNamePl(''); setNameEn(''); setDescPl(''); setDescEn(''); 
      setImageUrl(''); setDifficulty('Łatwy / Początkujący'); 
      setTempRange('22-26°C'); setHumidityRange('60-80%'); setLifespan('15+ lat');
      setIsHidden(false);
      setCards([]);
      setFile(null);
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
      
      const { data: { publicUrl } } = supabase.storage.from('geckos').getPublicUrl(fileName);
      setUploading(false);
      return publicUrl;
    } catch (err) {
      console.error('Błąd kompresji/uploadu:', err);
      setUploading(false);
      return imageUrl;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    const finalImageUrl = await uploadImage();
    
    const { error } = await supabase.from('caresheets').upsert({
      id: activeSpecies,
      namePl, nameEn,
      descriptionPl: descPl,
      descriptionEn: descEn,
      image_url: finalImageUrl,
      difficulty,
      temp_range: tempRange,
      humidity_range: humidityRange,
      lifespan,
      is_hidden: isHidden,
      cards: cards
    });

    if (error) {
      alert('Błąd: ' + error.message);
    } else {
      await revalidateSiteAction();
      alert('Zapisano pomyślnie i odświeżono pamięć podręczną!');
    }
    setSaving(false);
  };

  const addCard = () => {
    setCards([...cards, { id: Math.random().toString(), iconName: 'Grid', titlePl: '', titleEn: '', descPl: '', descEn: '' }]);
  };

  const updateCard = (index: number, field: string, value: string) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };

  const removeCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-earth-dark/5 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-earth-dark/10 bg-earth-beige/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <FileText className="w-6 h-6 text-earth-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-earth-dark">Zarządzanie Poradnikami</h2>
              <p className="text-earth-dark/60 text-sm">Edytuj strukturalne kafelki dla Gatunków (Caresheets).</p>
            </div>
          </div>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <label className="flex items-center gap-2 cursor-pointer group bg-white border border-earth-dark/10 px-4 py-2 rounded-lg hover:bg-earth-beige/10 transition-colors">
                <input 
                  type="checkbox" 
                  checked={isHidden} 
                  onChange={e => setIsHidden(e.target.checked)}
                  className="w-4 h-4 rounded border-earth-dark/20 text-earth-accent focus:ring-earth-accent cursor-pointer"
                />
                <span className="text-sm font-bold text-earth-dark group-hover:text-earth-accent transition-colors">Ukryj ten poradnik</span>
              </label>
              <select 
                value={activeSpecies} 
                onChange={(e) => setActiveSpecies(e.target.value)}
                className="px-4 py-2 border border-earth-dark/20 rounded-lg bg-white text-earth-dark font-medium cursor-pointer"
              >
                {categoriesList.length > 0 ? (
                  categoriesList.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.namePl}</option>
                  ))
                ) : (
                  <option value="leopard-gecko">Brak kategorii w bazie</option>
                )}
              </select>
            </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {loading ? (
             <div className="flex justify-center"><LoaderCircle className="w-8 h-8 animate-spin" /></div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block font-bold text-sm mb-1">Nazwa (PL)</label><input value={namePl} onChange={e=>setNamePl(e.target.value)} className="w-full border p-2 rounded" /></div>
              <div><label className="block font-bold text-sm mb-1">Nazwa (EN)</label><input value={nameEn} onChange={e=>setNameEn(e.target.value)} className="w-full border p-2 rounded" /></div>
              <div className="col-span-full"><label className="block font-bold text-sm mb-1">Krótki opis (PL)</label><textarea value={descPl} onChange={e=>setDescPl(e.target.value)} className="w-full border p-2 rounded" rows={2}/></div>
              <div className="col-span-full"><label className="block font-bold text-sm mb-1">Krótki opis (EN)</label><textarea value={descEn} onChange={e=>setDescEn(e.target.value)} className="w-full border p-2 rounded" rows={2}/></div>
            </div>

            <div className="bg-earth-beige/20 p-6 rounded-xl border border-earth-dark/10 space-y-4">
              <h3 className="text-lg font-bold text-earth-dark border-b border-earth-dark/10 pb-2">Dane do wizytówki i nagłówka</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block font-bold text-sm mb-1">Poziom trudności</label><input value={difficulty} onChange={e=>setDifficulty(e.target.value)} className="w-full border p-2 rounded bg-white" placeholder="np. Łatwy / Początkujący" /></div>
                <div><label className="block font-bold text-sm mb-1">Długość życia</label><input value={lifespan} onChange={e=>setLifespan(e.target.value)} className="w-full border p-2 rounded bg-white" placeholder="np. 15-20 lat" /></div>
                <div><label className="block font-bold text-sm mb-1">Zakres temperatur</label><input value={tempRange} onChange={e=>setTempRange(e.target.value)} className="w-full border p-2 rounded bg-white" placeholder="np. 22-26°C" /></div>
                <div><label className="block font-bold text-sm mb-1">Zakres wilgotności</label><input value={humidityRange} onChange={e=>setHumidityRange(e.target.value)} className="w-full border p-2 rounded bg-white" placeholder="np. 60-80%" /></div>
              </div>

              <div className="mt-4">
                <label className="block font-bold text-sm mb-2">Główne zdjęcie (Hero Image)</label>
                {imageUrl && !file && (
                  <div className="mb-4 relative w-full md:w-1/2 aspect-[16/9] rounded-lg overflow-hidden border border-earth-dark/20">
                    <Image 
                      src={imageUrl} 
                      alt="Current" 
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover" 
                    />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-earth-dark/30 rounded-lg cursor-pointer hover:bg-earth-dark/5 transition-colors w-full md:w-auto">
                    <ImageIcon className="w-5 h-5 text-earth-dark/60" />
                    <span className="text-earth-dark/80 font-medium">{file ? file.name : 'Wybierz nowe zdjęcie z dysku...'}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
                  </label>
                  {file && <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-600 font-medium px-3 py-2">Anuluj zmianę zdjęcia</button>}
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Kafelki Informacyjne</h3>
                <button onClick={addCard} className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded font-medium hover:bg-gray-200"><Plus className="w-4 h-4"/> Dodaj Kafelek</button>
              </div>

              <div className="space-y-4">
                {cards.map((card, idx) => (
                  <div key={card.id || idx} className="p-4 border border-earth-dark/10 rounded-xl relative bg-earth-beige/10">
                    <button onClick={() => removeCard(idx)} className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-5 h-5"/></button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-12">
                      <div><label className="block text-xs font-bold mb-1">Tytuł PL</label><input value={card.titlePl} onChange={e=>updateCard(idx, 'titlePl', e.target.value)} className="w-full border p-2 rounded text-sm" /></div>
                      <div><label className="block text-xs font-bold mb-1">Tytuł EN</label><input value={card.titleEn} onChange={e=>updateCard(idx, 'titleEn', e.target.value)} className="w-full border p-2 rounded text-sm" /></div>
                      <div className="col-span-full"><label className="block text-xs font-bold mb-1">Krótki opis kafelka PL</label><textarea value={card.descPl} onChange={e=>updateCard(idx, 'descPl', e.target.value)} className="w-full border p-2 rounded text-sm" /></div>
                      <div className="col-span-full"><label className="block text-xs font-bold mb-1">Krótki opis kafelka EN</label><textarea value={card.descEn} onChange={e=>updateCard(idx, 'descEn', e.target.value)} className="w-full border p-2 rounded text-sm" /></div>
                      
                      <div className="col-span-full"><label className="block text-xs font-bold mb-1">Pełna treść kafelka PL (Opcjonalnie)</label>
                        <TiptapEditor value={card.contentPl || ''} onChange={(val) => updateCard(idx, 'contentPl', val)} />
                      </div>
                      <div className="col-span-full"><label className="block text-xs font-bold mb-1">Pełna treść kafelka EN (Opcjonalnie)</label>
                        <TiptapEditor value={card.contentEn || ''} onChange={(val) => updateCard(idx, 'contentEn', val)} />
                      </div>

                      <div className="col-span-full">
                        <label className="block text-xs font-bold mb-1">Ikona Kafelka</label>
                        <select 
                          value={card.iconName} 
                          onChange={e=>updateCard(idx, 'iconName', e.target.value)} 
                          className="w-full border p-2 rounded text-sm bg-white"
                        >
                          <option value="Home">Home (Terrarium / Dom)</option>
                          <option value="TreePine">TreePine (Wystrój / Gałęzie)</option>
                          <option value="ThermometerSun">ThermometerSun (Temperatura)</option>
                          <option value="Droplets">Droplets (Wilgotność / Woda)</option>
                          <option value="Apple">Apple (Dieta / Jedzenie)</option>
                          <option value="HeartHandshake">HeartHandshake (Oswajanie)</option>
                          <option value="Egg">Egg (Rozmnażanie / Jaja)</option>
                          <option value="ShieldCheck">ShieldCheck (Rutyna / Zdrowie)</option>
                          <option value="Zap">Zap (Behawior / Aktywność)</option>
                          <option value="Sprout">Sprout (Roślinność)</option>
                          <option value="Compass">Compass (Planowanie)</option>
                          <option value="Info">Info (Informacje)</option>
                          <option value="Grid">Grid (Inne)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-earth-dark/10">
              <button disabled={saving || uploading} onClick={handleSave} className="flex items-center gap-2 bg-earth-accent hover:bg-earth-dark text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md">
                {(saving || uploading) ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Zapisz Poradnik
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
