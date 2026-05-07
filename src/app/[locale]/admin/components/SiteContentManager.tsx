'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { revalidateSiteAction } from '@/app/actions/revalidate';
import { LoaderCircle, Save, FileText } from 'lucide-react';
import TiptapEditor from './TiptapEditor';

const availableSections = [
  { id: 'home_about', name: 'Sekcja "O nas" (Strona główna)' },
  { id: 'contact_info', name: 'Dane kontaktowe (Strona Kontakt)' },
  { id: 'hero_desc', name: 'Główny tekst pod powitaniem (Hero)' }
];

export default function SiteContentManager() {
  const [activeSection, setActiveSection] = useState('home_about');
  const [contentPl, setContentPl] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState<'pl' | 'en'>('pl');

  useEffect(() => {
    fetchContent();
  }, [activeSection]);

  const fetchContent = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('id', activeSection)
      .single();

    if (data) {
      setContentPl(data.content_pl || '');
      setContentEn(data.content_en || '');
    } else {
      setContentPl('<p>Wpisz treść tutaj...</p>');
      setContentEn('<p>Wpisz treść w języku angielskim...</p>');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('site_content')
      .upsert({
        id: activeSection,
        content_pl: contentPl,
        content_en: contentEn,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      alert('Błąd podczas zapisu: ' + error.message);
    } else {
      // Trigger on-demand revalidation via authenticated server action
      // (no secret token needed on the client side)
      await revalidateSiteAction();
      alert('Treść pomyślnie zapisana! Strona zostanie zaktualizowana.');
    }
    setSaving(false);
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
              <h2 className="text-2xl font-bold text-earth-dark">Treści podstron</h2>
              <p className="text-earth-dark/60 text-sm">Zarządzaj blokami tekstu pojawiającymi się na głównych podstronach.</p>
            </div>
          </div>
          
          <select 
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-earth-dark/20 rounded-lg bg-white text-earth-dark font-medium cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-earth-accent"
          >
            {availableSections.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {loading ? (
          <div className="flex justify-center p-12">
             <LoaderCircle className="w-8 h-8 animate-spin text-earth-accent" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex gap-2 mb-4 border-b border-earth-dark/10 pb-2">
              <button 
                onClick={() => setActiveLang('pl')}
                className={`px-4 py-2 font-bold rounded-t-lg transition ${activeLang === 'pl' ? 'bg-earth-dark text-earth-beige border-b-4 border-earth-accent' : 'text-earth-dark/60 hover:bg-earth-beige/50'}`}
              >
                Polska wersja 🇵🇱
              </button>
              <button 
                onClick={() => setActiveLang('en')}
                className={`px-4 py-2 font-bold rounded-t-lg transition ${activeLang === 'en' ? 'bg-earth-dark text-earth-beige border-b-4 border-earth-accent' : 'text-earth-dark/60 hover:bg-earth-beige/50'}`}
              >
                English version 🇬🇧
              </button>
            </div>

            <div className={activeLang === 'pl' ? 'block' : 'hidden'}>
              <TiptapEditor value={contentPl} onChange={setContentPl} />
            </div>
            <div className={activeLang === 'en' ? 'block' : 'hidden'}>
              <TiptapEditor value={contentEn} onChange={setContentEn} />
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-earth-accent hover:bg-earth-dark text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 text-lg"
              >
                {saving ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Opublikuj Treść
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
