'use client';

import { logoutAction } from '@/app/actions/adminAuth';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

// Dynamic imports for optimization
const GeckoManager = dynamic(() => import('./components/GeckoManager'), { loading: () => <div className="p-12 text-center text-earth-dark/40 font-bold animate-pulse">Ładowanie Menedżera Ofert...</div> });
const SiteContentManager = dynamic(() => import('./components/SiteContentManager'), { loading: () => <div className="p-12 text-center text-earth-dark/40 font-bold animate-pulse">Ładowanie Treści...</div> });
const CaresheetsManager = dynamic(() => import('./components/CaresheetsManager'), { loading: () => <div className="p-12 text-center text-earth-dark/40 font-bold animate-pulse">Ładowanie Poradników...</div> });
const CategoriesManager = dynamic(() => import('./components/CategoriesManager'), { loading: () => <div className="p-12 text-center text-earth-dark/40 font-bold animate-pulse">Ładowanie Kategorii...</div> });
const BreedersManager = dynamic(() => import('./components/BreedersManager'), { loading: () => <div className="p-12 text-center text-earth-dark/40 font-bold animate-pulse">Ładowanie Hodowli...</div> });
const TranslationsManager = dynamic(() => import('./components/TranslationsManager'), { loading: () => <div className="p-12 text-center text-earth-dark/40 font-bold animate-pulse">Ładowanie Tłumaczeń...</div> });
const SettingsManager = dynamic(() => import('./components/SettingsManager'), { loading: () => <div className="p-12 text-center text-earth-dark/40 font-bold animate-pulse">Ładowanie Ustawień...</div> });


export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('content');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await logoutAction();
    router.refresh();
  };

  const tabs = [
    { id: 'content', label: 'Teksty, Tłumaczenia i Treści (CMS)' },
    { id: 'categories', label: 'Gatunki i Filtry' },
    { id: 'breeders', label: 'Nasza Hodowla' },
    { id: 'geckos', label: 'Sklep / Oferta' },
    { id: 'caresheets', label: 'Poradniki' },
    { id: 'settings', label: 'Ustawienia' }
  ];

  return (
    <div className="min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-earth-dark/10 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-earth-dark">Dashboard</h1>
          <p className="text-earth-dark/60 mt-2">Zarządzaj potężnym systemem CMS jaszczurek</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" />
          Wyloguj
        </button>
      </div>

      <div className="mb-8 flex overflow-x-auto gap-2 bg-white p-2 rounded-xl border border-earth-dark/5 shadow-sm">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-lg font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-earth-dark text-earth-beige shadow-md' : 'text-earth-dark/60 hover:bg-earth-beige/50 hover:text-earth-dark'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'content' && (
          <div className="space-y-12">
             <div className="bg-earth-beige/20 p-2 rounded-3xl">
                <TranslationsManager />
             </div>
             <div className="bg-earth-beige/20 p-2 rounded-3xl">
                <SiteContentManager />
             </div>
          </div>
        )}
        {activeTab === 'categories' && <CategoriesManager />}
        {activeTab === 'breeders' && <BreedersManager />}
        {activeTab === 'geckos' && <GeckoManager />}
        {activeTab === 'caresheets' && <CaresheetsManager />}
        {activeTab === 'settings' && <SettingsManager />}
      </div>
    </div>
  );
}
