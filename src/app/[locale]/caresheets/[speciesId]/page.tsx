'use client';

import { use } from 'react';
import { useLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { ChevronLeft, ThermometerSun, Apple, Grid, HeartHandshake, TreePine, Info, LoaderCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

const iconMap: Record<string, React.ReactNode> = {
  ThermometerSun: <ThermometerSun className="w-8 h-8 text-orange-500" />,
  Apple: <Apple className="w-8 h-8 text-green-500" />,
  Grid: <Grid className="w-8 h-8 text-earth-accent" />,
  HeartHandshake: <HeartHandshake className="w-8 h-8 text-red-400" />,
  TreePine: <TreePine className="w-8 h-8 text-green-700" />,
  Info: <Info className="w-8 h-8 text-blue-500" />
};

export default function SpeciesCaresheetPage({ params }: { params: Promise<{ speciesId: string }> | { speciesId: string } }) {
  const locale = useLocale();
  const isPl = locale === 'pl';
  
  // Handle both Next.js 14 and 15 param resolution
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const { speciesId } = resolvedParams;

  const [species, setSpecies] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSpecies() {
      const { data } = await supabase.from('caresheets').select('*').eq('id', speciesId).single();
      setSpecies(data);
      setLoading(false);
    }
    fetchSpecies();
  }, [speciesId]);

  if (!loading && !species) {
    notFound();
  }

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center"><LoaderCircle className="w-10 h-10 animate-spin text-earth-accent" /></div>;
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/caresheets" className="inline-flex items-center text-earth-dark/60 hover:text-earth-accent transition-colors mb-8 font-medium">
          <ChevronLeft className="w-5 h-5 mr-1" />
          {isPl ? 'Wróć do listy gatunków' : 'Back to species list'}
        </Link>
        
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-earth-accent/5 rounded-full blur-3xl -z-10"></div>
          <h1 className="text-4xl md:text-6xl font-black text-earth-dark mb-6 tracking-tight">
            {isPl ? species.namePl : species.nameEn}
          </h1>
          <div className="w-24 h-1.5 bg-earth-accent rounded-full mx-auto mb-8"></div>
          <div className="prose-earth mx-auto">
            <p className="text-xl md:text-2xl text-earth-dark/70 leading-relaxed font-medium">
              {isPl ? species.descriptionPl : species.descriptionEn}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {(species.cards || []).map((card: any, index: number) => (
            <motion.div 
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white/40 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-earth-dark/5 border border-white/60 hover:border-earth-accent/20 hover:shadow-2xl hover:shadow-earth-accent/5 hover:-translate-y-1.5 transition-all duration-500 group flex flex-col"
            >
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-6">
                  <div className="p-5 bg-white rounded-3xl shadow-lg shadow-earth-dark/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    {iconMap[card.iconName] || <Info className="w-10 h-10 text-earth-dark" />}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-earth-dark leading-tight group-hover:text-earth-accent transition-colors">
                    {isPl ? card.titlePl : card.titleEn}
                  </h3>
                </div>

                <div className="prose-earth">
                  <p className="text-lg md:text-xl text-earth-dark/80 leading-relaxed font-medium">
                    {isPl ? card.descPl : card.descEn}
                  </p>
                  
                  {((isPl && card.contentPl) || (!isPl && card.contentEn)) && (
                    <div className="mt-8 pt-8 border-t border-earth-dark/10 space-y-4">
                      <div className="text-earth-dark/70 leading-relaxed text-lg">
                        {isPl ? card.contentPl : card.contentEn}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
