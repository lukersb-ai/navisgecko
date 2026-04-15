'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { supabase } from '@/lib/supabase';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function CaresheetsGalleryPage() {
  const t = useTranslations('Caresheets');
  const locale = useLocale();
  const isPl = locale === 'pl';
  const [caresheetsDB, setCaresheetsDB] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('caresheets').select('*');
      if (data) setCaresheetsDB(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-earth-dark mb-4">{t('pageTitle')}</h1>
          <p className="text-earth-dark/70 text-lg max-w-2xl mx-auto">
            {t('pageDesc')}
          </p>
        </div>

        {loading ? (
             <div className="flex justify-center p-12"><Loader2 className="w-10 h-10 animate-spin text-earth-accent" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {caresheetsDB.map((species, index) => (
              <Link key={species.id} href={`/caresheets/${species.id}`} className="group">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-gradient-to-br from-white to-earth-beige/30 rounded-3xl p-8 md:p-10 shadow-lg border border-earth-dark/10 hover:shadow-2xl hover:scale-[1.02] hover:border-earth-accent/40 transition-all duration-300 h-full flex flex-col justify-between relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-earth-accent/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-earth-accent/20 transition-colors duration-500" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-earth-dark/5 rounded-full blur-2xl -ml-10 -mb-10 group-hover:bg-earth-dark/10 transition-colors duration-500" />
                  
                  <div className="relative z-10 mb-8">
                    <div className="w-12 h-1 bg-earth-accent rounded-full mb-6"></div>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-earth-dark mb-4 leading-tight group-hover:text-earth-accent transition-colors">
                      {isPl ? species.namePl.replace(/Gekony orzęsione/i, 'Gekon orzęsiony').replace(/Gekony lamparcie/i, 'Gekon lamparci').replace(/Gekony/i, 'Gekon') : species.nameEn}
                    </h3>
                    <p className="text-earth-dark/70 text-lg leading-relaxed line-clamp-3">
                      {isPl ? species.descriptionPl : species.descriptionEn}
                    </p>
                  </div>
                  
                  <div className="relative z-10 flex items-center justify-end mt-auto pt-6 border-t font-bold text-lg border-earth-dark/10 group-hover:border-earth-accent/30 transition-colors">
                    <div className="flex items-center text-earth-accent drop-shadow-sm">
                      <span>{isPl ? 'Rozpocznij lekturę' : 'Read Guide'}</span>
                      <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
            {caresheetsDB.length === 0 && (
              <div className="col-span-full text-center text-earth-dark/60 py-12 border-2 border-dashed border-earth-dark/20 rounded-xl">
                 Baza poradników jest pusta. Użyj panelu administratora, aby dodać gatunki.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
