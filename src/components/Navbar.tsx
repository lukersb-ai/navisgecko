'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import Image from 'next/image';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const pathname = usePathname();

  const navigation = [
    { name: t('home'), href: '/' },
    { name: t('about'), href: '/#about' },
    { name: t('available'), href: '/available' },
    { name: t('caresheets'), href: '/caresheets' as any },
    { name: t('contact'), href: '/contact' },
  ];

  return (
    <nav className="bg-earth-dark text-earth-beige sticky top-0 z-50 shadow-xl shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group transition-all duration-300 hover:scale-105">
              <Image 
                 src="/logo-clean.png" 
                 alt="Navis Gecko Logo" 
                 width={80} 
                 height={80} 
                 className="object-contain shrink-0 transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(232,115,23,0.6)] group-hover:scale-110" 
                 priority
              />
              <span className="-ml-3 mt-1 font-bold text-lg md:text-xl text-earth-beige/90 tracking-tight whitespace-nowrap group-hover:text-earth-accent transition-all">Navis Gecko</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-2 lg:space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-earth-beige hover:text-earth-accent px-2 lg:px-3 py-2 rounded-md text-sm lg:text-base font-bold transition-all hover:scale-105 whitespace-nowrap"
              >
                {item.name}
              </Link>
            ))}

            {/* Desktop Language Switcher */}
            <div className="flex items-center bg-earth-beige/10 rounded-lg p-1 ml-4 border border-earth-beige/20">
               <Link 
                 href={pathname} 
                 locale="pl"
                 className={`px-3 py-1 text-sm font-bold rounded ${locale === 'pl' ? 'bg-earth-accent text-white' : 'text-earth-beige hover:bg-earth-beige/20'}`}
               >
                 PL
               </Link>
               <Link 
                 href={pathname} 
                 locale="en"
                 className={`px-3 py-1 text-sm font-bold rounded ${locale === 'en' ? 'bg-earth-accent text-white' : 'text-earth-beige hover:bg-earth-beige/20'}`}
               >
                 EN
               </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-3">
             {/* Mobile Language Switcher */}
             <div className="flex items-center bg-earth-beige/10 rounded-lg p-1 border border-earth-beige/20">
               <Link 
                 href={pathname} 
                 locale="pl"
                 className={`px-2 py-1 text-xs font-bold rounded ${locale === 'pl' ? 'bg-earth-accent text-white' : 'text-earth-beige hover:bg-earth-beige/20'}`}
               >
                 PL
               </Link>
               <Link 
                 href={pathname} 
                 locale="en"
                 className={`px-2 py-1 text-xs font-bold rounded ${locale === 'en' ? 'bg-earth-accent text-white' : 'text-earth-beige hover:bg-earth-beige/20'}`}
               >
                 EN
               </Link>
            </div>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-earth-beige hover:text-earth-accent focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-earth-main">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href as any}
                onClick={() => setIsOpen(false)}
                className="text-earth-beige hover:text-earth-accent block px-3 py-2 rounded-md text-base font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
