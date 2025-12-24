import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  const locales = ['en', 'ar'];
  // إذا كان requestLocale عبارة عن Promise، انتظر نتيجته
  let resolvedLocale: string | undefined;
  if (typeof requestLocale === 'object' && typeof requestLocale.then === 'function') {
    const awaited = await requestLocale;
    resolvedLocale = typeof awaited === 'string' ? awaited : undefined;
  } else {
    resolvedLocale = typeof requestLocale === 'string' ? requestLocale : undefined;
  }
  const locale: string = resolvedLocale && locales.includes(resolvedLocale) ? resolvedLocale : 'en';

  try {
    const messages = (await import(`./app/locales/${locale}/common.json`)).default;
    return {
      locale,
      messages,
      timeZone: 'UTC',
    };
  } catch (err) {
    return {
      locale,
      messages: {},
      timeZone: 'UTC',
    };
  }
});
