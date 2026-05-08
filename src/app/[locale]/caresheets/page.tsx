'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { supabase } from '@/lib/supabase';
import { ChevronRight, LoaderCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function CaresheetsGalleryPage() {
  const t = useTranslations('Caresheets');
  const locale = useLocale();
  const isPl = locale === 'pl';
  const [caresheetsDB, setCaresheetsDB] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Fetch only caresheets where the category is not private
      const { data: categories } = await supabase.from('categories').select('id').eq('isPrivate', false);
      const publicIds = categories?.map(c => c.id) || [];
      
      const { data } = await supabase.from('caresheets').select('*').in('id', publicIds);
      if (data) setCaresheetsDB(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-earth-accent/5 rounded-full blur-3xl -z-10"></div>
          <h1 className="text-4xl md:text-6xl font-black text-earth-dark mb-4 tracking-tight">{t('pageTitle')}</h1>
          <div className="w-24 h-1.5 bg-earth-accent rounded-full mx-auto mb-8"></div>
          <p className="text-xl md:text-2xl text-earth-dark/70 max-w-3xl mx-auto font-medium">
            {t('pageDesc')}
          </p>
        </div>

        {loading ? (
             <div className="flex justify-center p-12"><LoaderCircle className="w-10 h-10 animate-spin text-earth-accent" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {caresheetsDB.map((species, index) => (
              <Link key={species.id} href={`/caresheets/${species.id}`} className="group">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-white/40 backdrop-blur-sm rounded-[2.5rem] p-10 md:p-12 shadow-xl shadow-earth-dark/5 border border-white/60 hover:border-earth-accent/20 hover:shadow-2xl hover:shadow-earth-accent/5 hover:-translate-y-1.5 transition-all duration-500 h-full flex flex-col justify-between group"
                >
                  <div className="mb-8">
                    <div className="w-12 h-1.5 bg-earth-accent rounded-full mb-8"></div>
                    <h3 className="text-3xl md:text-4xl font-black text-earth-dark mb-6 leading-tight group-hover:text-earth-accent transition-colors">
                      {isPl ? species.namePl.replace(/Gekony orzęsione/i, 'Gekon orzęsiony').replace(/Gekony lamparcie/i, 'Gekon lamparci').replace(/Gekony/i, 'Gekon') : species.nameEn}
                    </h3>
                    <p className="text-earth-dark/70 text-lg md:text-xl leading-relaxed line-clamp-3 font-medium">
                      {isPl ? species.descriptionPl : species.descriptionEn}
                    </p>
                  </div>
                  
                  <div className="relative z-10 flex items-center justify-end mt-auto pt-8 border-t font-black text-xl border-earth-dark/10 group-hover:border-earth-accent/20 transition-colors">
                    <div className="flex items-center text-earth-accent">
                      <span>{t('readMore')}</span>
                      <ChevronRight className="w-7 h-7 ml-2 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
            {caresheetsDB.length === 0 && (
              <div className="col-span-full text-center text-earth-dark/60 py-12 border-2 border-dashed border-earth-dark/20 rounded-xl font-medium">
                 {t('empty')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
