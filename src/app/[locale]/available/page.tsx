'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Info, Weight, Dna, ShoppingCart, ChevronLeft, ChevronRight, Lock, Unlock } from 'lucide-react';
import { categories } from '@/data/geckos';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { supabase } from '@/lib/supabase';
import { useLocale } from 'next-intl';

function GeckoCard({ gecko, locale, pricesRevealed }: { gecko: any, locale: string, pricesRevealed?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const t = useTranslations('Available');
  const tGeckos = useTranslations('Geckos');

  const toggleExpand = () => setExpanded(!expanded);

  const getGenderIcon = (gender: string) => {
    const g = gender?.toLowerCase();
    if (g === 'male') return <span className="font-bold text-blue-500">♂ {tGeckos('genderMale')}</span>;
    if (g === 'female') return <span className="font-bold text-pink-500">♀ {tGeckos('genderFemale')}</span>;
    return <span>? {tGeckos('genderUnknown')}</span>;
  };

  const images = gecko.imageUrl ? [gecko.imageUrl] : ['/hero.png'];

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  const statusLower = gecko.status?.toLowerCase();

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-earth-dark/5 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl">
      
      {/* Photo Area */}
      <div className="relative h-64 w-full bg-earth-beige/50 group">
        <Image
          src={images[currentImage]}
          alt={gecko.morph || 'Gecko'}
          fill
          className="object-cover transition-opacity duration-300"
        />
        
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-2 h-2 rounded-full transition-colors ${idx === currentImage ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm text-white ${
            statusLower === 'available' ? 'bg-earth-light' : 
            statusLower === 'reserved' ? 'bg-earth-accent' : 'bg-gray-500'
          }`}>
            {statusLower === 'available' ? t('statusAvailable') : statusLower === 'reserved' ? t('statusReserved') : 'Niedostępny'}
          </span>
        </div>
      </div>

      {/* Data Area */}
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold text-earth-dark">
            {gecko.hidePrice && (!pricesRevealed || ['sold', 'reserved'].includes(gecko.status?.toLowerCase()))
              ? t('askPrice') || 'Zapytaj' 
              : (locale === 'en' 
                 ? (gecko.priceEur ? `${gecko.priceEur} EUR` : t('askPrice') || 'Ask')
                 : (gecko.price ? `${gecko.price} PLN` : t('askPrice') || 'Zapytaj')
                )
            }
          </h3>
          <span className="text-sm font-mono text-earth-dark/50 bg-earth-beige/50 px-2 py-1 rounded">{t('id')}: {gecko.internalId}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col">
            <span className="text-xs text-earth-dark/50 uppercase tracking-wider mb-1 flex items-center gap-1"><Dna className="w-3 h-3"/> {t('morph')}</span>
            <span className="font-semibold text-earth-main">{gecko.morph}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-earth-dark/50 uppercase tracking-wider mb-1">{t('gender')}</span>
            {getGenderIcon(gecko.gender)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-earth-dark/50 uppercase tracking-wider mb-1 flex items-center gap-1"><Weight className="w-3 h-3"/> {t('weight')}</span>
            <span className="font-medium text-earth-dark">{gecko.weight || 0}g</span>
          </div>
        </div>

        {/* Expandable Description Button */}
        {gecko.description && (
          <button
            onClick={toggleExpand}
            className="w-full flex items-center justify-between text-earth-dark/80 bg-earth-beige/30 hover:bg-earth-beige/50 p-3 rounded-lg transition-colors font-medium text-sm mt-auto mb-6"
          >
            <span className="flex items-center gap-2"><Info className="w-4 h-4"/> {t('details')}</span>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </button>
        )}

        {/* Expanded Details using Framer Motion */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-2 pb-6 text-earth-dark/80 text-sm leading-relaxed border-t border-earth-dark/5 mt-2">
                {gecko.description}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Buy Button */}
        <div className={gecko.description ? '' : 'mt-auto'}>
          <Link
            href={`/contact?gecko=${gecko.internalId}`}
            className={`w-full flex justify-center items-center gap-2 py-3.5 rounded-xl font-bold transition-all duration-300 ${
              statusLower === 'available' 
                ? 'bg-earth-dark text-earth-beige hover:bg-earth-main shadow-lg hover:shadow-earth-main/30'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none'
            }`}
          >
            {statusLower === 'available' ? (
              <>
                <ShoppingCart className="w-5 h-5" />
                {t('reserve')}
              </>
            ) : (
              statusLower === 'reserved' ? t('reserved') : (locale === 'pl' ? 'Niedostępny' : 'Unavailable')
            )}
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function AvailableGeckos() {
  const [geckosDB, setGeckosDB] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [pricesRevealed, setPricesRevealed] = useState(false);
  const t = useTranslations('Available');
  const locale = useLocale();

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('pricesRevealed') === 'true') {
      setPricesRevealed(true);
    }
    
    async function load() {
      const [gRes, cRes] = await Promise.all([
        supabase.from('geckos').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*')
      ]);
      if (gRes.data) setGeckosDB(gRes.data.filter((g: any) => g.isHidden !== true));
      if (cRes.data) setCategories(cRes.data);
      setLoading(false);
    }
    load();
  }, []);

  const filteredGeckos = activeFilter === 'all' 
    ? geckosDB 
    : geckosDB.filter(g => g.categoryId === activeFilter);

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-earth-dark mb-4">{t('title')}</h1>
          <p className="text-earth-dark/70 text-lg max-w-2xl mb-8">
            {t('description')}
          </p>
          
          {!loading && categories.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-10 w-full overflow-x-auto pb-4 pt-2 pl-2 -ml-2 scrollbar-hide">
              <button 
                onClick={() => setActiveFilter('all')}
                className={`px-8 py-3.5 rounded-full font-bold transition-all shadow-md whitespace-nowrap text-lg ${activeFilter === 'all' ? 'bg-earth-dark text-earth-beige scale-105' : 'bg-white text-earth-dark hover:bg-earth-beige'}`}
              >
                {locale === 'pl' ? 'Wszystkie' : 'All'}
              </button>
              {categories.map(c => (
                <button 
                  key={c.id}
                  onClick={() => setActiveFilter(c.id)}
                  className={`px-8 py-3.5 rounded-full font-bold transition-all shadow-md whitespace-nowrap text-lg ${activeFilter === c.id ? 'bg-earth-dark text-earth-beige scale-105' : 'bg-white text-earth-dark hover:bg-earth-beige'}`}
                >
                  {locale === 'pl' ? c.namePl : c.nameEn}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-12 h-12 border-4 border-earth-accent/30 border-t-earth-accent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGeckos.length > 0 ? (
              filteredGeckos.map((gecko) => (
                <GeckoCard key={gecko.id} gecko={gecko} locale={locale} pricesRevealed={pricesRevealed} />
              ))
            ) : (
              <div className="col-span-full text-center text-earth-dark/60 py-12 border-2 border-dashed border-earth-dark/20 rounded-xl">
                Brak gekonów w tej kategorii.
              </div>
            )}
          </div>
        )}

        {/* Secret Padlock */}
        {!loading && (
          <div className="mt-16 flex justify-center opacity-20 hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={() => {
                if (pricesRevealed) {
                  setPricesRevealed(false);
                  sessionStorage.removeItem('pricesRevealed');
                } else {
                  const pwd = window.prompt('podaj haslo');
                  if (pwd === (process.env.NEXT_PUBLIC_PRICE_PASSWORD || 'navis')) {
                    setPricesRevealed(true);
                    sessionStorage.setItem('pricesRevealed', 'true');
                  } else if (pwd !== null) {
                    alert(locale === 'pl' ? 'Nieprawidłowe hasło' : 'Incorrect password');
                  }
                }
              }}
              className="p-4 rounded-full hover:bg-earth-beige/50"
              title="Secret"
              aria-label="Secret"
            >
              {pricesRevealed ? <Unlock className="w-5 h-5 text-earth-dark/50" /> : <Lock className="w-5 h-5 text-earth-dark/50" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
