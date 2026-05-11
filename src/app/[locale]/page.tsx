import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { supabase } from '@/lib/supabase';
import BreedersList from './components/BreedersList';
import HeroSlider from './components/HeroSlider';

export const revalidate = 3600; // Cache for 1 hour (on-demand revalidation handles instant CMS updates)

export default async function Home({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  const t = await getTranslations('Home');

  // Fetch CMS Content (Specific columns only)
  const { data: aboutData } = await supabase.from('site_content').select('content_pl, content_en').eq('id', 'home_about').single();
  const { data: heroData } = await supabase.from('site_content').select('content_pl, content_en').eq('id', 'hero_desc').single();
  
  // Fetch Breeders and Categories (Specific columns only)
  const { data: breeders } = await supabase.from('breeders').select('id, name, imageUrl, categoryId, sort_order').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
  const { data: categories } = await supabase.from('categories').select('id, namePl, nameEn, isPrivate').eq('isPrivate', false);
  
  // Filter categories to only those that have breeders
  const breederCategoryIds = new Set(breeders?.map(b => b.categoryId) || []);
  const activeCategories = (categories || []).filter(c => breederCategoryIds.has(c.id));

  const aboutHtml = locale === 'pl' ? aboutData?.content_pl : aboutData?.content_en;
  const heroHtml = locale === 'pl' ? heroData?.content_pl : heroData?.content_en;

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <div className="relative z-10 shadow-[0_15px_40px_rgba(0,0,0,0.25)]">
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
          <HeroSlider />

          {/* Hero Content */}
          <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto mt-16 md:mt-0">
            <h1 
              className="text-4xl md:text-6xl font-bold text-earth-beige mb-6 tracking-tight"
              style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.4)' }}
            >
              {t('heroTitle')} <br/>
              <span 
                className="text-earth-accent text-3xl md:text-5xl mt-2 block"
                style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.3)' }}
              >
                {t('heroSubtitle')}
              </span>
            </h1>
            <div 
               className="mt-4 text-xl md:text-2xl text-earth-beige/90 mb-10 max-w-2xl mx-auto prose prose-invert prose-p:text-earth-beige/90"
               style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.3)' }}
               dangerouslySetInnerHTML={{ __html: heroHtml || t('heroDesc') }}
            />
            <Link
              href="/available"
              className="inline-flex items-center gap-2 bg-earth-accent hover:bg-[#f08c41] text-earth-beige px-8 py-4 rounded-full font-bold text-lg transition-all duration-500 ease-out hover:scale-105 shadow-xl hover:shadow-earth-accent/40 relative overflow-hidden group"
              style={{ 
                willChange: 'transform, background-color',
                backfaceVisibility: 'hidden',
                WebkitFontSmoothing: 'antialiased'
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                {t('heroButton')}
                <ArrowRight className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              
              {/* Subtle shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
            </Link>
          </div>
        </section>
      </div>

      {/* About Section */}
      <section id="about" className="py-24 bg-earth-beige relative scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Tekst - "O nas" */}
            <div className="space-y-6 flex flex-col items-center">
              <h2 className="text-3xl md:text-4xl font-bold text-earth-dark">{t('aboutTitle')}</h2>
              <div className="w-20 h-1 bg-earth-accent rounded"></div>
              
              {aboutHtml ? (
                <div 
                  className="prose prose-earth max-w-none text-earth-dark/80 text-left md:text-center mt-6" 
                  dangerouslySetInnerHTML={{ __html: aboutHtml }}
                />
              ) : (
                <p className="text-lg text-earth-dark/80 leading-relaxed mt-6">
                  {t('aboutDesc')}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Separator */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-earth-dark/10 to-transparent"></div>

      {/* Breeding Stock Teaser */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-earth-dark mb-4">{t('breedersTitle')}</h2>
            <div className="w-20 h-1 bg-earth-accent rounded mx-auto mb-6"></div>
            <p className="text-lg text-earth-dark/70">
              {t('breedersDesc')}
            </p>
          </div>

          <BreedersList 
            breeders={breeders || []} 
            categories={activeCategories} 
            locale={locale} 
          />
          
        </div>
      </section>

    </div>
  );
}
