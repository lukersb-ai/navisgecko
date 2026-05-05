import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { supabase } from '@/lib/supabase';
import HeroSlider from './components/HeroSlider';

export const revalidate = 0;

export default async function Home({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  const t = await getTranslations('Home');

  // Fetch CMS Content
  const { data: aboutData } = await supabase.from('site_content').select('*').eq('id', 'home_about').single();
  const { data: heroData } = await supabase.from('site_content').select('*').eq('id', 'hero_desc').single();
  
  // Fetch Breeders and Categories
  const { data: breeders } = await supabase.from('breeders').select('*').order('created_at', { ascending: false });
  const { data: categories } = await supabase.from('categories').select('*');

  const aboutHtml = locale === 'pl' ? aboutData?.content_pl : aboutData?.content_en;
  const heroHtml = locale === 'pl' ? heroData?.content_pl : heroData?.content_en;

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
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
            className="inline-flex items-center gap-2 bg-earth-accent hover:bg-earth-brown text-earth-beige px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-earth-accent/30"
          >
            {t('heroButton')}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-background">
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

      {/* Breeding Stock Teaser */}
      <section className="py-24 bg-earth-beige/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-earth-dark mb-4">{t('breedersTitle')}</h2>
            <div className="w-20 h-1 bg-earth-accent rounded mx-auto mb-6"></div>
            <p className="text-lg text-earth-dark/70">
              {t('breedersDesc')}
            </p>
          </div>

          <div className="space-y-16">
            {categories?.map((cat) => {
              const catBreeders = breeders?.filter(b => b.categoryId === cat.id) || [];
              if (catBreeders.length === 0) return null;

              return (
                <div key={cat.id}>
                  <h3 className="text-2xl font-bold text-earth-dark mb-6 border-b border-earth-dark/10 pb-2">
                    {locale === 'pl' ? cat.namePl : cat.nameEn}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {catBreeders.map((reptile) => (
                      <div key={reptile.id} className="relative group rounded-3xl overflow-hidden shadow-xl h-[400px] transition-all duration-500">
                        {/* Background Image */}
                        <Image src={reptile.imageUrl || "/hero.png"} alt={reptile.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {(!breeders || breeders.length === 0) && (
              <div className="text-center text-earth-dark/50 p-12 border-2 border-dashed border-earth-dark/20 rounded-xl">
                 Zaloguj się do panelu administratora i zajrzyj do sekcji "Nasza Hodowla" aby dodać urokome opisy własnych gekonów.
              </div>
            )}
          </div>
          
        </div>
      </section>

    </div>
  );
}
