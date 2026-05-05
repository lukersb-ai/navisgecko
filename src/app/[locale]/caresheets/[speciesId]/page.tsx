'use client';

import { use } from 'react';
import { useLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { ChevronLeft, ThermometerSun, Apple, Grid, HeartHandshake, TreePine, Info, Loader2 } from 'lucide-react';
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
     return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-earth-accent" /></div>;
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/caresheets" className="inline-flex items-center text-earth-dark/60 hover:text-earth-accent transition-colors mb-8 font-medium">
          <ChevronLeft className="w-5 h-5 mr-1" />
          {isPl ? 'Wróć do listy gatunków' : 'Back to species list'}
        </Link>
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-earth-dark mb-4">
            {isPl ? species.namePl : species.nameEn}
          </h1>
          <p className="text-earth-dark/70 text-lg max-w-2xl mx-auto">
            {isPl ? species.descriptionPl : species.descriptionEn}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {(species.cards || []).map((card: any, index: number) => (
            <motion.div 
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-earth-beige/30 rounded-3xl p-8 md:p-10 shadow-md border border-earth-dark/5 hover:border-earth-accent/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-start"
            >
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="p-4 bg-white/60 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  {iconMap[card.iconName] || <Info className="w-8 h-8 text-earth-dark" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-extrabold text-earth-dark mb-3 group-hover:text-earth-accent transition-colors">
                    {isPl ? card.titlePl : card.titleEn}
                  </h3>
                  <p className="text-earth-dark/70 leading-relaxed text-lg">
                    {isPl ? card.descPl : card.descEn}
                  </p>
                  
                  {((isPl && card.contentPl) || (!isPl && card.contentEn)) && (
                    <div className="mt-6 pt-6 border-t border-earth-dark/10">
                      <p className="text-earth-dark/80 leading-relaxed">
                        {isPl ? card.contentPl : card.contentEn}
                      </p>
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
