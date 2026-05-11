'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Info, Weight, Dna, ShoppingCart, ChevronLeft, ChevronRight, Lock, Unlock } from 'lucide-react';

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
    if (g === 'male') return <span className="font-bold text-blue-400">♂ {tGeckos('genderMale')}</span>;
    if (g === 'female') return <span className="font-bold text-pink-400">♀ {tGeckos('genderFemale')}</span>;
    return <span className="font-medium text-gray-400">{tGeckos('genderUnknown')}</span>;
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
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
            {statusLower === 'available' ? t('statusAvailable') : statusLower === 'reserved' ? t('statusReserved') : t('statusSold')}
          </span>
        </div>
      </div>

      {/* Data Area */}
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold text-earth-dark">
            {(() => {
              if (['sold', 'reserved'].includes(gecko.status?.toLowerCase())) return '---';
              if (gecko.hidePrice && !pricesRevealed) return t('askPrice');
              const price = locale === 'en' ? gecko.priceEur : gecko.price;
              const currency = locale === 'en' ? 'EUR' : 'PLN';
              return price ? `${price} ${currency}` : t('askPrice');
            })()}
          </h3>
          <span className="text-sm font-mono text-earth-dark/50 bg-earth-beige/50 px-2 py-1 rounded">{t('id')}: {gecko.internalId}</span>
        </div>

        <motion.div layout className="grid grid-cols-2 gap-4 mb-3">
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
            <span className="font-medium text-earth-dark">{gecko.weight && gecko.weight !== 0 ? `${gecko.weight}g` : '-'}</span>
          </div>

          {/* Details Button - Neutral & Medium-Small */}
          {gecko.description && (
            <div className="flex flex-col">
              <span className="text-[10px] text-earth-dark/40 uppercase tracking-widest mb-1">{t('info')}</span>
              <button
                onClick={toggleExpand}
                className="flex items-center gap-1 text-earth-dark/60 hover:text-earth-dark transition-all font-bold text-[10px] uppercase tracking-wider w-fit group ml-1 mt-0.5"
              >
                <Info className="w-2.5 h-2.5 text-earth-dark/30 group-hover:text-earth-dark/50 transition-colors" />
                <span className="border-b border-earth-dark/10 group-hover:border-earth-dark/30 transition-colors">
                  {expanded ? t('showLess') : t('details')}
                </span>
                <motion.div
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-3.5 h-3.5 opacity-20 group-hover:opacity-50" />
                </motion.div>
              </button>
            </div>
          )}
        </motion.div>

        {/* Expanded Details BELOW the grid */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="details"
              layout
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ 
                height: { type: "spring", stiffness: 200, damping: 25 },
                opacity: { duration: 0.15 }
              }}
              className="overflow-hidden"
            >
              <div className="pt-2 pb-3 text-earth-dark/70 text-[13px] leading-relaxed border-t border-earth-dark/5">
                <p className="italic">
                  {locale === 'pl' ? gecko.description : (gecko.description_en || gecko.description)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Buy Button */}
        <motion.div layout className={gecko.description ? '' : 'mt-auto'}>
          <Link
            href={`/contact?gecko=${gecko.internalId}`}
            className={`w-full flex justify-center items-center gap-2 py-3.5 rounded-xl font-bold transition-all duration-300 ${
              statusLower === 'available' 
                ? 'bg-earth-dark text-earth-beige hover:bg-earth-main shadow-lg hover:shadow-earth-main/30'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none'
            }`}
          >
            {statusLower === 'available' ? (
              t('reserve')
            ) : (
              statusLower === 'reserved' ? t('reserved') : t('statusSold')
            )}
          </Link>
        </motion.div>

      </div>
    </div>
  );
}

import { getGeckosAction, verifyPricePassword, lockPrices } from '@/app/actions/geckos';

export default function AvailableGeckos() {
  const [geckosDB, setGeckosDB] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeGender, setActiveGender] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'none' | 'price-asc' | 'price-desc'>('none');
  const [loading, setLoading] = useState(true);
  const [pricesRevealed, setPricesRevealed] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const t = useTranslations('Available');
  const tGeckos = useTranslations('Geckos');
  const locale = useLocale();

  const handlePasswordSubmit = async () => {
    const success = await verifyPricePassword(passwordInput);
    if (success) {
      setPricesRevealed(true);
      setShowPasswordModal(false);
      // Reload geckos to get the secret ones from server
      setLoading(true);
      const data = await getGeckosAction();
      setGeckosDB(data.geckos);
      setCategories(data.categories);
      setLoading(false);
    } else {
      setPasswordError(t('passwordError'));
    }
  };

  const handleLock = async () => {
    await lockPrices();
    setPricesRevealed(false);
    setLoading(true);
    const data = await getGeckosAction();
    setGeckosDB(data.geckos);
    setCategories(data.categories);
    setLoading(false);
  };

  useEffect(() => {
    async function load() {
      const data = await getGeckosAction();
      setGeckosDB(data.geckos);
      setCategories(data.categories);
      setPricesRevealed(data.isRevealed);
      setLoading(false);
    }
    load();
  }, []);

  const filteredAndSortedGeckos = geckosDB
    .filter(g => {
      const matchesCategory = activeFilter === 'all' || g.categoryId === activeFilter;
      const matchesGender = activeGender === 'all' || g.gender?.toLowerCase() === activeGender;
      return matchesCategory && matchesGender;
    })
    .sort((a, b) => {
      // Hidden prices always at the end
      if (a.hidePrice && !b.hidePrice) return 1;
      if (!a.hidePrice && b.hidePrice) return -1;
      if (a.hidePrice && b.hidePrice) return 0;

      if (sortBy === 'price-asc') {
        const pA = locale === 'pl' ? (a.price || 0) : (a.priceEur || 0);
        const pB = locale === 'pl' ? (b.price || 0) : (b.priceEur || 0);
        return pA - pB;
      }
      if (sortBy === 'price-desc') {
        const pA = locale === 'pl' ? (a.price || 0) : (a.priceEur || 0);
        const pB = locale === 'pl' ? (b.price || 0) : (b.priceEur || 0);
        return pB - pA;
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-earth-dark">{t('title')}</h1>
          </div>

          <p className="text-earth-dark/70 text-lg max-w-2xl mb-8">
            {t('description')}
          </p>
          
          <div className="space-y-2">
            {/* Category Filter */}
            {!loading && categories.length > 1 && (
              <div className="flex flex-wrap gap-3 w-full overflow-x-auto pb-2 scrollbar-hide">
                <button 
                  onClick={() => setActiveFilter('all')}
                  className={`px-6 py-2.5 rounded-full font-bold transition-all shadow-md whitespace-nowrap ${activeFilter === 'all' ? 'bg-earth-dark text-earth-beige' : 'bg-white text-earth-dark hover:bg-earth-beige'}`}
                >
                  {locale === 'pl' ? 'Wszystkie gatunki' : 'All species'}
                </button>
                {categories.map(c => (
                  <button 
                    key={c.id}
                    onClick={() => setActiveFilter(c.id)}
                    className={`px-6 py-2.5 rounded-full font-bold transition-all shadow-md whitespace-nowrap ${activeFilter === c.id ? 'bg-earth-dark text-earth-beige' : 'bg-white text-earth-dark hover:bg-earth-beige'}`}
                  >
                    {locale === 'pl' ? c.namePl : c.nameEn}
                  </button>
                ))}
              </div>
            )}

            {/* Gender Filter & Sorting Row */}
            {!loading && activeFilter !== 'all' && (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-3 overflow-x-auto pb-2 scrollbar-hide ml-8">
                  <button 
                    onClick={() => setActiveGender('all')}
                    className={`px-6 py-2.5 rounded-full font-bold transition-all text-sm shadow-sm border whitespace-nowrap ${activeGender === 'all' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-white text-earth-dark border-earth-dark/10 hover:bg-green-50'}`}
                  >
                    {locale === 'pl' ? 'Wszystkie' : 'All'}
                  </button>
                  <button 
                    onClick={() => setActiveGender('male')}
                    className={`px-6 py-2.5 rounded-full font-bold transition-all text-sm shadow-sm border whitespace-nowrap ${activeGender === 'male' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-white text-earth-dark border-earth-dark/10 hover:bg-blue-50'}`}
                  >
                    ♂ {tGeckos('genderMale')}
                  </button>
                  <button 
                    onClick={() => setActiveGender('female')}
                    className={`px-6 py-2.5 rounded-full font-bold transition-all text-sm shadow-sm border whitespace-nowrap ${activeGender === 'female' ? 'bg-pink-100 text-pink-800 border-pink-200' : 'bg-white text-earth-dark border-earth-dark/10 hover:bg-pink-50'}`}
                  >
                    ♀ {tGeckos('genderFemale')}
                  </button>
                  <button 
                    onClick={() => setActiveGender('unknown')}
                    className={`px-6 py-2.5 rounded-full font-bold transition-all text-sm shadow-sm border whitespace-nowrap ${activeGender === 'unknown' ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-white text-earth-dark border-earth-dark/10 hover:bg-gray-50'}`}
                  >
                    {tGeckos('genderUnknown')}
                  </button>
                </div>

                <div className="flex items-center gap-1 pr-2">
                  <button 
                    onClick={() => setSortBy(sortBy === 'price-asc' ? 'none' : 'price-asc')}
                    className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${sortBy === 'price-asc' ? 'text-earth-main' : 'text-earth-dark/40 hover:text-earth-dark'}`}
                  >
                    {t('sortAsc')} ↑
                  </button>
                  <span className="text-earth-dark/10 text-[10px]">|</span>
                  <button 
                    onClick={() => setSortBy(sortBy === 'price-desc' ? 'none' : 'price-desc')}
                    className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${sortBy === 'price-desc' ? 'text-earth-main' : 'text-earth-dark/40 hover:text-earth-dark'}`}
                  >
                    {t('sortDesc')} ↓
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-12 h-12 border-4 border-earth-accent/30 border-t-earth-accent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {filteredAndSortedGeckos.slice(0, visibleCount).map((gecko, idx) => (
                <GeckoCard key={gecko.id} gecko={gecko} locale={locale} pricesRevealed={pricesRevealed} />
              ))}
            </div>

            {/* Load More Button */}
            {filteredAndSortedGeckos.length > visibleCount && (
              <div className="mt-16 text-center">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 12)}
                  className="px-8 py-4 bg-white border-2 border-earth-dark/10 text-earth-dark rounded-full font-bold hover:bg-earth-beige/20 transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  Pokaż więcej ({filteredAndSortedGeckos.length - visibleCount})
                </button>
              </div>
            )}
            {filteredAndSortedGeckos.length === 0 && (
              <div className="col-span-full text-center text-earth-dark/60 py-12 border-2 border-dashed border-earth-dark/20 rounded-xl">
                {t('noResults')}
              </div>
            )}
          </>
        )}

        {/* Secret Padlock */}
        {!loading && (
          <div className={`mt-16 flex justify-center transition-opacity duration-300 relative ${showPasswordModal ? 'opacity-100' : 'opacity-60 md:opacity-20 hover:opacity-100'}`}>
            <AnimatePresence>
              {showPasswordModal && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full mb-3 bg-white/60 backdrop-blur-md rounded-full p-3 shadow-lg border border-white/40 flex items-center gap-3 z-10"
                >
                  <input 
                    type="password"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setPasswordError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePasswordSubmit();
                      }
                    }}
                    placeholder={t('passwordPlaceholder')}
                    className="w-48 px-4 py-2.5 rounded-full border border-white/50 focus:outline-none focus:ring-2 focus:ring-earth-main/50 bg-white/50 text-base placeholder:text-earth-dark/50 text-earth-dark"
                    autoFocus
                  />
                  <button
                    onClick={handlePasswordSubmit}
                    className="px-6 py-2.5 rounded-full text-base font-bold bg-earth-dark text-earth-beige hover:bg-earth-main transition-colors"
                  >
                    OK
                  </button>
                  <button 
                    onClick={() => setShowPasswordModal(false)}
                    className="px-3 py-2 text-earth-dark/60 hover:text-earth-dark transition-colors font-bold text-lg"
                  >
                    ✕
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={() => {
                if (pricesRevealed) {
                  handleLock();
                } else {
                  setShowPasswordModal(!showPasswordModal);
                  setPasswordInput('');
                  setPasswordError('');
                }
              }}
              className={`p-4 rounded-full transition-all duration-300 ${showPasswordModal ? 'opacity-0 invisible scale-90' : 'opacity-100 visible hover:bg-earth-beige/50'}`}
              title="Secret"
              aria-label="Secret"
            >
              {pricesRevealed ? <Unlock className="w-5 h-5 text-earth-dark/50" /> : <Lock className="w-5 h-5 text-earth-dark/50" />}
            </button>
            
            {passwordError && showPasswordModal && (
              <span className="absolute top-full mt-2 text-xs text-red-500 font-medium bg-white/80 px-2 py-1 rounded-md backdrop-blur-sm shadow-sm border border-white/50">
                {passwordError}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
