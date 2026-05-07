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
        
        <div className="border-t border-earth-main mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-earth-beige/60">
          <p>&copy; {new Date().getFullYear()} Navis Gecko. {t('rights')}</p>
          
          <div className="flex items-center gap-3">
            <span className="text-earth-beige/50 text-xs uppercase tracking-widest">Odwiedź nas na</span>
            
            {/* Facebook */}
            <a
              href="https://www.facebook.com/navisgecko"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="p-2 rounded-full bg-earth-beige/10 hover:bg-[#1877F2]/20 hover:text-[#1877F2] text-earth-beige/60 transition-all duration-300 hover:scale-110"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/navisgecko/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2 rounded-full bg-earth-beige/10 hover:bg-[#E1306C]/20 hover:text-[#E1306C] text-earth-beige/60 transition-all duration-300 hover:scale-110"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/48123456789"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="p-2 rounded-full bg-earth-beige/10 hover:bg-[#25D366]/20 hover:text-[#25D366] text-earth-beige/60 transition-all duration-300 hover:scale-110"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
