"use client";
import { NextIntlClientProvider } from "next-intl";
import { Suspense } from "react";
import { ThemeProvider } from "../theme-provider";
import { LocaleProvider } from "../contexts/LocaleContext";



export default function LocaleLayoutClient({ children, locale }) {
  const safeLocale = typeof locale === "string" ? locale : "ar";
  const dir = safeLocale === "ar" ? "rtl" : "ltr";
  // Dynamically import all namespaces for the current locale
  const messages = require(`../locales/${safeLocale}/index.cjs`);

  return (
    <NextIntlClientProvider locale={safeLocale} messages={messages}>
      <LocaleProvider>
        <ThemeProvider>
          <Suspense>
            <main id="main-content" dir={dir}>
              {children}
            </main>
          </Suspense>
        </ThemeProvider>
      </LocaleProvider>
    </NextIntlClientProvider>
  );
}