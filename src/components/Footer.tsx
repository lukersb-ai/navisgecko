import { Mail, Phone, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

export default function Footer() {
  const t = useTranslations('Footer');
  const tNav = useTranslations('Navbar');

  return (
    <footer className="bg-earth-dark text-earth-beige mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-6 hover:opacity-80 transition">
              <Image 
                 src="/logo-clean.png" 
                 alt="Navis Gecko Logo" 
                 width={128} 
                 height={128} 
                 className="object-contain shrink-0" 
              />
              <span className="-ml-3 font-bold text-xl tracking-tight">Navis Gecko</span>
            </Link>
            <p className="text-sm text-earth-beige/80">
              {t('description')}
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">{t('links')}</h3>
            <ul className="space-y-2 text-sm text-earth-beige/80">
              <li><Link href="/" className="hover:text-earth-accent transition">{tNav('home')}</Link></li>
              <li><Link href="/#about" className="hover:text-earth-accent transition">{tNav('about')}</Link></li>
              <li><Link href="/available" className="hover:text-earth-accent transition">{tNav('available')}</Link></li>
              <li><Link href="/caresheets" className="hover:text-earth-accent transition">{tNav('caresheets')}</Link></li>
              <li><Link href="/contact" className="hover:text-earth-accent transition">{tNav('contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">{t('contact')}</h3>
            <ul className="space-y-3 text-sm text-earth-beige/80">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-earth-accent" />
                {t('address')}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-earth-accent" />
                <a href={`tel:${t('phone').replace(/\s/g, '')}`} className="hover:text-earth-accent transition">{t('phone')}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-earth-accent" />
                <a href={`mailto:${t('email')}`} className="hover:text-earth-accent transition">{t('email')}</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-earth-main mt-8 pt-8 text-center text-sm text-earth-beige/60">
          <p>&copy; {new Date().getFullYear()} Navis Gecko. {t('rights')}</p>
        </div>
      </div>
    </footer>
  );
}
