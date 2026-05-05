'use client';

import { logoutAction } from '@/app/actions/adminAuth';
import { useRouter } from 'next/navigation';
import { LogOut, Image as ImageIcon, CheckCircle, LayoutDashboard, Settings } from 'lucide-react';
import GeckoManager from './components/GeckoManager';
import SiteContentManager from './components/SiteContentManager';
import CaresheetsManager from './components/CaresheetsManager';
import CategoriesManager from './components/CategoriesManager';
import BreedersManager from './components/BreedersManager';
import TranslationsManager from './components/TranslationsManager';
import { useState } from 'react';

import { supabase } from '@/lib/supabase';

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
    { id: 'caresheets', label: 'Poradniki' }
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
      </div>
    </div>
  );
}
