'use client';

import { useTranslations, useLocale } from 'next-intl';

import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { ChevronRight, ThermometerSun, Droplets } from 'lucide-react';

export default function CaresheetsClient({ caresheets }: { caresheets: any[] }) {
  const t = useTranslations('Caresheets');
  const locale = useLocale();
  const isPl = locale === 'pl';

  return (
    <div className={`grid gap-8 ${
      caresheets.length === 1 ? 'grid-cols-1 max-w-3xl mx-auto' : 
      caresheets.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-6xl mx-auto' : 
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    }`}>
      {caresheets.map((species, index) => (
        <Link key={species.id} href={`/caresheets/${species.id}`} className="group">
          <div 
            className={`bg-white rounded-2xl shadow-xl border border-earth-dark/5 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl group h-full ${
              caresheets.length === 1 ? 'min-h-[900px]' : 
              caresheets.length === 2 ? 'min-h-[800px]' : 
              'min-h-[600px]'
            }`}
          >
            {/* Image Section */}
            <div className={`relative w-full bg-earth-beige/50 ${
              caresheets.length === 1 ? 'h-[500px]' : 
              caresheets.length === 2 ? 'h-[400px]' : 
              'h-64'
            }`}>
              {species.image_url ? (
                <Image 
                  src={species.image_url} 
                  alt={isPl ? species.namePl : species.nameEn} 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-earth-dark/20 font-bold">Brak zdjęcia</div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-earth-dark mb-4 leading-tight group-hover:text-earth-accent transition-colors">
                  {isPl ? species.namePl.replace(/Gekony orzęsione/i, 'Gekon orzęsiony').replace(/Gekony lamparcie/i, 'Gekon lamparci').replace(/Gekony/i, 'Gekon') : species.nameEn}
                </h3>
                
                <p className="text-earth-dark/70 text-lg leading-relaxed line-clamp-4 mb-10">
                  {isPl ? species.descriptionPl : species.descriptionEn}
                </p>
              </div>
              
              <div>
                {/* Metadata */}
                <div className="flex items-center gap-8 mb-10 mt-auto">
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
              <div className="w-full flex justify-center items-center gap-2 py-3.5 rounded-xl font-bold transition-all duration-300 bg-earth-dark text-earth-beige hover:bg-earth-main shadow-lg hover:shadow-earth-main/30">
                <span>{t('readMore')}</span>
                <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
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
