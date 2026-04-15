'use client';

import { useState, useEffect } from 'react';
import { getTranslationsList, saveTranslationsList } from '@/app/actions/translations';
import { Loader2, Save, Type, LayoutList } from 'lucide-react';

export default function TranslationsManager() {
  const [dataPl, setDataPl] = useState<any>(null);
  const [dataEn, setDataEn] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeNamespace, setActiveNamespace] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const result = await getTranslationsList();
    if (result) {
      setDataPl(result.pl);
      setDataEn(result.en);
      setActiveNamespace(Object.keys(result.pl)[0]);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { success } = await saveTranslationsList(dataPl, dataEn);
    if (success) {
      alert('Tłumaczenia zapisane pomyślnie! Zmiany są widoczne na stronie.');
    } else {
      alert('Wystąpił błąd podczas zapisywania.');
    }
    setSaving(false);
  };

  const handleChange = (locale: 'pl' | 'en', namespace: string, key: string, value: string) => {
    if (locale === 'pl') {
      setDataPl({ ...dataPl, [namespace]: { ...dataPl[namespace], [key]: value } });
    } else {
      setDataEn({ ...dataEn, [namespace]: { ...dataEn[namespace], [key]: value } });
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-12 h-12 text-earth-accent animate-spin" /></div>;
  if (!dataPl) return <div className="p-10 text-center text-xl text-red-500">Błąd ładowania tekstów. Odśwież stronę.</div>;

  const namespaces = Object.keys(dataPl);
  // Friendly names for categories
  const categoryNames: Record<string, string> = {
    'Navbar': 'Nawigacja (Górne Menu)',
    'Footer': 'Stopka',
    'Home': 'Strona Główna (Wizytówka)',
    'Geckos': 'Gekony (Słowniczek)',
    'Available': 'Dostępne Zwierzęta',
    'Contact': 'Strona Kontaktu',
    'Caresheets': 'Poradniki'
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-earth-dark/10">
      <div className="p-8 border-b border-earth-dark/10 bg-gradient-to-r from-earth-beige/30 to-white flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-earth-accent/10 rounded-2xl">
             <Type className="w-8 h-8 text-earth-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-earth-dark">Edytor Tekstów</h2>
            <p className="text-earth-dark/60 text-lg mt-1">Wybierz kategorię i edytuj napisy na stronie.</p>
          </div>
        </div>
        <button disabled={saving} onClick={handleSave} className="flex items-center gap-3 bg-earth-accent hover:bg-earth-dark text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
          {saving ? <Loader2 className="w-6 h-6 animate-spin"/> : <Save className="w-6 h-6"/>}
          {saving ? 'Zapisywanie...' : 'Zapisz Wprowadzone Zmiany'}
        </button>
      </div>

      <div className="p-8 pb-4">
         <h3 className="text-xl font-bold text-earth-dark mb-4 flex items-center gap-2"><LayoutList className="w-5 h-5"/> Krok 1: Wybierz sekcję do edycji</h3>
         <div className="flex flex-wrap gap-3">
          {namespaces.map(ns => (
            <button 
              key={ns}
              onClick={() => setActiveNamespace(ns)}
              className={`px-6 py-4 rounded-2xl text-lg font-bold transition-all ${
                activeNamespace === ns 
                  ? 'bg-earth-accent text-white shadow-md border-b-4 border-earth-dark/20' 
                  : 'bg-gray-100 text-earth-dark hover:bg-gray-200 border-b-4 border-transparent'
              }`}
            >
              {categoryNames[ns] || ns}
            </button>
          ))}
         </div>
      </div>

      <div className="bg-gray-50/50 p-8 border-t border-earth-dark/5">
        {activeNamespace && dataPl[activeNamespace] && (
          <div className="max-w-4xl mx-auto space-y-10">
            <h3 className="text-2xl font-bold text-earth-dark border-b-2 border-earth-accent/20 pb-4 inline-block">
              Edytujesz: {categoryNames[activeNamespace] || activeNamespace}
            </h3>
            
            <div className="space-y-8">
              {Object.keys(dataPl[activeNamespace])
                .filter(key => !['heroDesc', 'aboutDesc', 'aboutList1', 'aboutList2', 'aboutList3', 'aboutList4', 'pageDesc'].includes(key))
                .map((key, index) => {
                 const plVal = dataPl[activeNamespace][key];
                 const enVal = dataEn[activeNamespace]?.[key] || '';
                 const isLongText = plVal.length > 50;

                 return (
                  <div key={key} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative pl-12 transition-all hover:shadow-md hover:border-earth-accent/30">
                    <div className="absolute top-6 left-4 w-6 h-6 bg-earth-accent text-white font-bold rounded-full flex items-center justify-center text-xs">
                      {index + 1}
                    </div>
                    <div className="mb-4">
                      <span className="text-sm font-mono text-gray-400 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">Klucz systemu: {key}</span>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <label className="text-sm font-black text-blue-800 mb-2 flex items-center gap-2">
                           🇵🇱 Wersja Polska (Twój główny język)
                        </label>
                        {isLongText ? (
                           <textarea 
                              value={plVal}
                              onChange={(e) => handleChange('pl', activeNamespace, key, e.target.value)}
                              className="w-full border-2 border-gray-200 focus:border-blue-500 p-4 rounded-xl text-lg min-h-[120px] shadow-inner font-medium text-gray-800"
                           />
                        ) : (
                           <input 
                              value={plVal}
                              onChange={(e) => handleChange('pl', activeNamespace, key, e.target.value)}
                              className="w-full border-2 border-gray-200 focus:border-blue-500 p-4 rounded-xl text-lg shadow-inner font-medium text-gray-800"
                           />
                        )}
                      </div>

                      <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                        <label className="text-sm font-black text-red-800 mb-2 flex items-center gap-2">
                           🇬🇧 Wersja Angielska (Dla klientów z zagranicy)
                        </label>
                        {isLongText ? (
                           <textarea 
                              value={enVal}
                              onChange={(e) => handleChange('en', activeNamespace, key, e.target.value)}
                              className="w-full border-2 border-gray-200 focus:border-red-500 p-4 rounded-xl text-base min-h-[100px] shadow-inner text-gray-700"
                           />
                        ) : (
                           <input 
                              value={enVal}
                              onChange={(e) => handleChange('en', activeNamespace, key, e.target.value)}
                              className="w-full border-2 border-gray-200 focus:border-red-500 p-4 rounded-xl text-base shadow-inner text-gray-700"
                           />
                        )}
                      </div>
                    </div>
                  </div>
                 );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
