'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { supabase } from '@/lib/supabase';

function ContactForm() {
  const searchParams = useSearchParams();
  const geckoIdParam = searchParams.get('gecko') || '';
  const t = useTranslations('Contact');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    geckoId: geckoIdParam,
    message: '',
    website: '' // honeypot
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Update geckoId if param changes and component is mounted
  useEffect(() => {
    if (geckoIdParam) {
      setFormData(prev => ({ ...prev, geckoId: geckoIdParam }));
    }
  }, [geckoIdParam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setFormData({ name: '', email: '', geckoId: '', message: '' });
      } else {
        setError(data.message || t('errorGeneric'));
      }
    } catch (err) {
      setError(t('errorGeneric'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-earth-beige/50 border border-earth-light rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-earth-light" />
        </div>
        <h3 className="text-2xl font-bold text-earth-dark mb-2">{t('successTitle')}</h3>
        <p className="text-earth-dark/80">
          {t('successDesc')}
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="mt-6 px-6 py-2 bg-earth-dark text-earth-beige rounded-lg hover:bg-earth-main transition-colors"
        >
          {t('sendAnother')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-earth-dark/10">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-earth-dark mb-2">{t('nameLabel')}</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-earth-main/30 bg-earth-beige/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-earth-accent focus:border-transparent transition-all"
          placeholder={t('namePlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-earth-dark mb-2">{t('emailLabel')}</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-earth-main/30 bg-earth-beige/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-earth-accent focus:border-transparent transition-all"
          placeholder={t('emailPlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="geckoId" className="block text-sm font-medium text-earth-dark mb-2">{t('geckoLabel')}</label>
        <input
          type="text"
          id="geckoId"
          name="geckoId"
          value={formData.geckoId}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-earth-main/30 bg-earth-beige/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-earth-accent focus:border-transparent transition-all"
          placeholder={t('geckoPlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-earth-dark mb-2">{t('messageLabel')}</label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={formData.message}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border border-earth-main/30 bg-earth-beige/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-earth-accent focus:border-transparent transition-all"
          placeholder={t('messagePlaceholder')}
        ></textarea>
      </div>

      {/* Honeypot field - completely invisible to real users but bots will fill it */}
      <div className="absolute opacity-0 -z-10 h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-earth-accent hover:bg-earth-brown text-white py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? t('sending') : (
          <>
            {t('send')}
            <Send className="w-5 h-5 pointer-events-none" />
          </>
        )}
      </button>
    </form>
  );
}

export default function ContactPage() {
  const t = useTranslations('Contact');
  const locale = useLocale();
  const [contentHtml, setContentHtml] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('site_content').select('*').eq('id', 'contact_info').single().then(({ data }) => {
      if (data) setContentHtml(locale === 'pl' ? data.content_pl : data.content_en);
    });
  }, [locale]);

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-earth-dark mb-4">{t('pageTitle')}</h1>
          {contentHtml ? (
            <div 
              className="prose prose-earth max-w-none text-earth-dark/80 mx-auto" 
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          ) : (
            <p className="text-earth-dark/70 text-lg">
              {t('pageDesc')}
            </p>
          )}
        </div>

        <Suspense fallback={<div className="text-center py-10">{t('formLoading')}</div>}>
          <ContactForm />
        </Suspense>

      </div>
    </div>
  );
}
