'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Trash2, Save, FileText } from 'lucide-react';
import TiptapEditor from './TiptapEditor';

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
  const [cards, setCards] = useState<any[]>([]);

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
      setCards(data.cards || []);
    } else {
      // Default to empty if totally new
      setNamePl(''); setNameEn(''); setDescPl(''); setDescEn(''); setCards([]);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('caresheets').upsert({
      id: activeSpecies,
      namePl, nameEn,
      descriptionPl: descPl,
      descriptionEn: descEn,
      cards: cards
    });

    if (error) alert('Błąd: ' + error.message);
    else alert('Zapisano pomyślnie!');
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
          <select 
            value={activeSpecies} 
            onChange={(e) => setActiveSpecies(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-earth-dark/20 rounded-lg bg-white text-earth-dark font-medium cursor-pointer"
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

      <div className="p-6 md:p-8">
        {loading ? (
             <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block font-bold text-sm mb-1">Nazwa (PL)</label><input value={namePl} onChange={e=>setNamePl(e.target.value)} className="w-full border p-2 rounded" /></div>
              <div><label className="block font-bold text-sm mb-1">Nazwa (EN)</label><input value={nameEn} onChange={e=>setNameEn(e.target.value)} className="w-full border p-2 rounded" /></div>
              <div className="col-span-full"><label className="block font-bold text-sm mb-1">Krótki opis (PL)</label><textarea value={descPl} onChange={e=>setDescPl(e.target.value)} className="w-full border p-2 rounded" rows={2}/></div>
              <div className="col-span-full"><label className="block font-bold text-sm mb-1">Krótki opis (EN)</label><textarea value={descEn} onChange={e=>setDescEn(e.target.value)} className="w-full border p-2 rounded" rows={2}/></div>
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
                      <div className="col-span-full"><label className="block text-xs font-bold mb-1">Treść kafelka PL</label><textarea value={card.descPl} onChange={e=>updateCard(idx, 'descPl', e.target.value)} className="w-full border p-2 rounded text-sm" /></div>
                      <div className="col-span-full"><label className="block text-xs font-bold mb-1">Treść kafelka EN</label><textarea value={card.descEn} onChange={e=>updateCard(idx, 'descEn', e.target.value)} className="w-full border p-2 rounded text-sm" /></div>
                      <div className="col-span-full">
                        <label className="block text-xs font-bold mb-1">Ikona Kafelka</label>
                        <select 
                          value={card.iconName} 
                          onChange={e=>updateCard(idx, 'iconName', e.target.value)} 
                          className="w-full border p-2 rounded text-sm bg-white"
                        >
                          <option value="Info">Info (Zwykła informacja)</option>
                          <option value="ThermometerSun">ThermometerSun (Temperatura / Ciepło)</option>
                          <option value="Apple">Apple (Dieta / Jedzenie)</option>
                          <option value="Grid">Grid (Terrarium / Przestrzeń pozioma)</option>
                          <option value="TreePine">TreePine (Terrarium / Gałęzie / Przestrzeń wertykalna)</option>
                          <option value="HeartHandshake">HeartHandshake (Oswajanie / Zachowanie)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-earth-dark/10">
              <button disabled={saving} onClick={handleSave} className="flex items-center gap-2 bg-earth-accent hover:bg-earth-dark text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Zapisz Poradnik
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
