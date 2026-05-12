'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { ChevronRight, ThermometerSun, Droplets } from 'lucide-react';

export default function CaresheetsClient({ caresheets }: { caresheets: any[] }) {
  const t = useTranslations('Caresheets');
  const locale = useLocale();
  const isPl = locale === 'pl';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {caresheets.map((species, index) => (
        <Link key={species.id} href={`/caresheets/${species.id}`} className="group">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ 
              y: -12,
              scale: 1.01,
              transition: { type: "spring", stiffness: 300, damping: 20 }
            }}
            transition={{ 
              delay: index * 0.05, 
              duration: 0.8, 
              ease: [0.16, 1, 0.3, 1] 
            }}
            className="bg-white/40 backdrop-blur-sm rounded-[2.5rem] p-4 pb-8 md:p-5 md:pb-10 shadow-xl shadow-earth-dark/5 border border-white/60 hover:border-earth-accent/30 transition-colors duration-500 h-full flex flex-col group will-change-transform transform-gpu"
          >
            {/* Image Section */}
            <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden mb-6 bg-earth-beige/50">
              {species.image_url ? (
                <Image 
                  src={species.image_url} 
                  alt={isPl ? species.namePl : species.nameEn} 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-earth-dark/20 font-bold">Brak zdjęcia</div>
              )}
            </div>

            {/* Content Section */}
            <div className="px-4 md:px-6 flex flex-col flex-grow">
              <h3 className="text-2xl md:text-3xl font-black text-earth-dark mb-4 leading-tight group-hover:text-earth-accent transition-colors">
                {isPl ? species.namePl.replace(/Gekony orzęsione/i, 'Gekon orzęsiony').replace(/Gekony lamparcie/i, 'Gekon lamparci').replace(/Gekony/i, 'Gekon') : species.nameEn}
              </h3>
              
              <p className="text-earth-dark/70 text-base md:text-lg leading-relaxed line-clamp-3 font-medium mb-6">
                {isPl ? species.descriptionPl : species.descriptionEn}
              </p>
              
              {/* Metadata */}
              <div className="flex items-center gap-6 mb-8 mt-auto">
                <div className="flex items-center gap-2 text-earth-dark/80 font-bold text-sm">
                  <ThermometerSun className="w-5 h-5 text-earth-dark/40" />
                  <span>{species.temp_range || '22-26°C'}</span>
                </div>
                <div className="flex items-center gap-2 text-earth-dark/80 font-bold text-sm">
                  <Droplets className="w-5 h-5 text-earth-dark/40" />
                  <span>{species.humidity_range || '60-80%'}</span>
                </div>
              </div>
              
              {/* Action Button */}
              <div className="w-full bg-earth-dark group-hover:bg-earth-main text-white text-center py-4 rounded-2xl font-black text-lg transition-all duration-500 ease-in-out flex items-center justify-center gap-2 shadow-lg group-hover:shadow-xl group-hover:shadow-earth-main/40 group-hover:-translate-y-0.5 transform-gpu">
                <span>{t('readMore')}</span>
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform duration-500 ease-out" />
              </div>
            </div>
          </motion.div>
        </Link>
      ))}
      {caresheets.length === 0 && (
        <div className="col-span-full text-center text-earth-dark/60 py-12 border-2 border-dashed border-earth-dark/20 rounded-xl font-medium">
           {t('empty')}
        </div>
      )}
    </div>
  );
}
