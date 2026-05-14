'use client';

import { use } from 'react';
import { useLocale } from 'next-intl';
import { notFound } from 'next/navigation';

import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { 
  ChevronLeft, ThermometerSun, Apple, Grid, HeartHandshake, TreePine, 
  Info, LoaderCircle, Droplets, Hourglass, Home, Waves, Sprout, 
  Egg, ShieldCheck, Zap, Compass, Bone, Search
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

const iconMap: Record<string, React.ReactNode> = {
  ThermometerSun: <ThermometerSun className="w-10 h-10 text-orange-500" />,
  Apple: <Apple className="w-10 h-10 text-green-500" />,
  Grid: <Grid className="w-10 h-10 text-earth-accent" />,
  HeartHandshake: <HeartHandshake className="w-10 h-10 text-red-400" />,
  TreePine: <TreePine className="w-10 h-10 text-green-700" />,
  Info: <Info className="w-10 h-10 text-blue-500" />,
  Home: <Home className="w-10 h-10 text-earth-accent" />,
  Waves: <Waves className="w-10 h-10 text-cyan-500" />,
  Sprout: <Sprout className="w-10 h-10 text-emerald-500" />,
  Egg: <Egg className="w-10 h-10 text-amber-500" />,
  ShieldCheck: <ShieldCheck className="w-10 h-10 text-indigo-500" />,
  Zap: <Zap className="w-10 h-10 text-yellow-500" />,
  Compass: <Compass className="w-10 h-10 text-slate-500" />,
  Bone: <Bone className="w-10 h-10 text-stone-400" />,
  Search: <Search className="w-10 h-10 text-sky-500" />,
  Droplets: <Droplets className="w-10 h-10 text-blue-400" />
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

  if (!loading && (!species || species.is_hidden)) {
    notFound();
  }

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center"><LoaderCircle className="w-10 h-10 animate-spin text-earth-accent" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative w-full h-[50vh] min-h-[400px] flex flex-col justify-center items-center text-center px-4">
        {species.image_url ? (
          <>
            <div className="absolute inset-0 w-full h-full">
              <Image 
                src={species.image_url} 
                alt="Hero" 
                fill
                priority
                className="object-cover" 
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-earth-dark"></div>
        )}
        
        <div className="relative z-10 max-w-4xl mx-auto mt-12">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-md">
            {isPl ? species.namePl : species.nameEn}
          </h1>
          <div className="w-24 h-1.5 bg-earth-accent rounded-full mx-auto shadow-lg"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Floating Metadata Card */}
        <div className="relative -mt-16 z-20 bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-16 border border-earth-dark/5 flex flex-wrap justify-center gap-8 md:gap-16">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-earth-accent/10 flex items-center justify-center mb-3">
              <ThermometerSun className="w-6 h-6 text-earth-accent" />
            </div>
            <span className="text-sm font-bold text-earth-dark/60 uppercase tracking-wider mb-1">Temperatura</span>
            <span className="text-lg font-black text-earth-dark">{species.temp_range || '22-26°C'}</span>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-earth-accent/10 flex items-center justify-center mb-3">
              <Droplets className="w-6 h-6 text-earth-accent" />
            </div>
            <span className="text-sm font-bold text-earth-dark/60 uppercase tracking-wider mb-1">Wilgotność</span>
            <span className="text-lg font-black text-earth-dark">{species.humidity_range || '60-80%'}</span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-earth-accent/10 flex items-center justify-center mb-3">
              <Hourglass className="w-6 h-6 text-earth-accent" />
            </div>
            <span className="text-sm font-bold text-earth-dark/60 uppercase tracking-wider mb-1">Długość życia</span>
            <span className="text-lg font-black text-earth-dark">{species.lifespan || '15+ lat'}</span>
          </div>

        </div>

        <Link href="/caresheets" className="inline-flex items-center text-earth-dark/60 hover:text-earth-accent transition-colors mb-8 font-medium">
          <ChevronLeft className="w-5 h-5 mr-1" />
          {isPl ? 'Wróć do listy gatunków' : 'Back to species list'}
        </Link>

        {/* Intro Description */}
        <div className="mb-16">
          <p className="text-xl md:text-2xl text-earth-dark/80 leading-relaxed font-medium">
            {isPl ? species.descriptionPl : species.descriptionEn}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {(species.cards || []).map((card: any, index: number) => (
            <div 
              key={card.id}
              className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-earth-dark/5 transition-all duration-300 hover:shadow-2xl group flex flex-col"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-6">
                  <div className="p-5 bg-earth-beige/50 rounded-2xl shadow-sm group-hover:scale-105 transition-transform duration-300">
                    {iconMap[card.iconName] || <Info className="w-10 h-10 text-earth-dark" />}
                  </div>
                  <h3 className="text-2xl font-bold text-earth-dark leading-tight group-hover:text-earth-accent transition-colors">
                    {isPl ? card.titlePl : card.titleEn}
                  </h3>
                </div>

                <div className="prose-earth">
                  <p className="text-lg md:text-xl text-earth-dark/80 leading-relaxed font-medium">
                    {isPl ? card.descPl : card.descEn}
                  </p>
                  
                  {((isPl && card.contentPl) || (!isPl && card.contentEn)) && (
                    <div className="mt-4 pt-4 border-t border-earth-dark/10 space-y-3">
                      <div 
                        className="text-earth-dark/70 leading-relaxed text-lg prose prose-earth prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: isPl ? card.contentPl : card.contentEn }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
