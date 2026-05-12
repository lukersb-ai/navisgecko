import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
import {getMessagesForLocale} from '@/app/actions/translations';

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // Pobierz tłumaczenia z bazy (lub cache) zamiast z plików JSON
  const messages = await getMessagesForLocale(locale);

  return {
    locale,
    messages: messages || (await import(`../../messages/${locale}.json`)).default
  };
});
