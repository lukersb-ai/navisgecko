'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface Breeder {
  id: string;
  name: string;
  imageUrl: string;
  categoryId: string;
}

interface Category {
  id: string;
  namePl: string;
  nameEn: string;
}

export default function BreedersList({ 
  breeders, 
  categories, 
  locale 
}: { 
  breeders: Breeder[], 
  categories: Category[], 
  locale: string 
}) {
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});

  const handleExpand = (catId: string) => {
    setVisibleCounts(prev => ({
      ...prev,
      [catId]: (prev[catId] || 9) + 9
    }));
  };

  return (
    <div className="space-y-16">
      {categories.map((cat) => {
        const catBreeders = breeders.filter(b => b.categoryId === cat.id) || [];
        if (catBreeders.length === 0) return null;

        const currentVisible = visibleCounts[cat.id] || 9;
        const displayedBreeders = catBreeders.slice(0, currentVisible);

        return (
          <div key={cat.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h3 className="text-2xl font-bold text-earth-dark mb-6 border-b border-earth-dark/10 pb-2">
              {locale === 'pl' ? cat.namePl : cat.nameEn}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {displayedBreeders.map((reptile) => (
                <div key={reptile.id} className="relative group rounded-3xl overflow-hidden shadow-xl h-[400px] transition-all duration-500">
                  <Image 
                    src={reptile.imageUrl || "/hero.png"} 
                    alt={reptile.name} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <span className="text-white font-bold text-lg">{reptile.name}</span>
                  </div>
                </div>
              ))}
            </div>

            {catBreeders.length > currentVisible && (
              <div className="mt-8 text-center">
                <button 
                  onClick={() => handleExpand(cat.id)}
                  className="px-6 py-2 border-2 border-earth-dark/10 text-earth-dark/60 rounded-full text-sm font-bold hover:bg-earth-beige/20 hover:text-earth-dark transition-all"
                >
                  Rozwiń (+{Math.min(9, catBreeders.length - currentVisible)})
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
