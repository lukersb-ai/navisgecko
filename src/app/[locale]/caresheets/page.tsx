import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase';
import CaresheetsClient from './CaresheetsClient';

export const revalidate = 3600; // Cache for 1 hour

export default async function CaresheetsGalleryPage() {
  const t = await getTranslations('Caresheets');

  // Fetch data natively on the server during build/revalidate
  const { data: categories } = await supabase.from('categories').select('id').eq('isPrivate', false);
  const publicIds = categories?.map(c => c.id) || [];
  
  const { data: caresheetsDB } = await supabase.from('caresheets')
    .select('id, namePl, nameEn, descriptionPl, descriptionEn, difficulty, temp_range, humidity_range, lifespan, image_url, is_hidden')
    .in('id', publicIds)
    .eq('is_hidden', false);

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-earth-accent/5 rounded-full blur-3xl -z-10"></div>
          <h1 className="text-4xl md:text-6xl font-black text-earth-dark mb-4 tracking-tight">{t('pageTitle')}</h1>
          <div className="w-24 h-1.5 bg-earth-accent rounded-full mx-auto mb-8"></div>
          <p className="text-xl md:text-2xl text-earth-dark/70 max-w-3xl mx-auto font-medium">
            {t('pageDesc')}
          </p>
        </div>

        <CaresheetsClient caresheets={caresheetsDB || []} />
      </div>
    </div>
  );
}
