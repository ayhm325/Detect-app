

import LocaleLayoutClient from "./LocaleLayoutClient";


export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  // LocaleLayoutClient already wraps with NextIntlClientProvider and passes messages
  return <LocaleLayoutClient locale={locale}>{children}</LocaleLayoutClient>;
}
