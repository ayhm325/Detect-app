

import React from 'react';
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "./components/ui/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Detect AI - نظام الكشف الذكي عن الأمراض بالذكاء الاصطناعي",
  description:
    "نظام متطور للكشف عن الأمراض من خلال تحليل الصور الطبية بالذكاء الاصطناعي. دقة عالية، نتائج فورية، خدمة 24/7",
  keywords: ["ذكاء اصطناعي", "تشخيص طبي", "أشعة سينية", "تحليل طبي", "الالتهاب الرئوي", "صحة"],
  authors: [{ name: "Detect AI Team" }],
  creator: "Detect AI",
  publisher: "Detect AI",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "ar_SA",
    alternateLocale: ["en_US"],
    url: "https://detect-ai.com",
    siteName: "Detect AI",
    title: "Detect AI - نظام الكشف الذكي عن الأمراض",
    description: "نظام متطور للكشف عن الأمراض من خلال تحليل الصور الطبية بالذكاء الاصطناعي",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Detect AI - Medical AI Diagnosis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Detect AI - نظام الكشف الذكي عن الأمراض",
    description: "نظام متطور للكشف عن الأمراض بالذكاء الاصطناعي",
    images: ["/twitter-image.jpg"],
  },
};


export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#fbbf24" },
      { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ],
  };
}


import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { LocaleProvider } from "./contexts/LocaleContext";
import { ThemeProvider } from "./theme-provider";

export default async function RootLayout({ children, params }) {
  const locale = params?.locale || "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const messages = (await getMessages()) || {};
  return (
    <html className={`${inter.variable} ${robotoMono.variable}`} lang={locale} dir={dir} data-scroll-behavior="smooth">
      <body>
        <script dangerouslySetInnerHTML={{ __html: `(function(){
          try {
            if (typeof window === 'undefined') return;
            const OrigWS = window.WebSocket;
            window.WebSocket = function(url, protocols){
              try{
                if (typeof url === 'string' && (url.includes(':5500') || url.includes('127.0.0.1:5500') || url.includes('localhost:5500'))) {
                  console.info('Blocked LiveReload WebSocket:', url);
                  return {
                    addEventListener: function(){},
                    removeEventListener: function(){},
                    close: function(){},
                    send: function(){},
                    readyState: 3
                  };
                }
              } catch (e) {}
              return new OrigWS(url, protocols);
            };
            try { window.WebSocket.prototype = OrigWS.prototype; } catch(e) {}
            ['CONNECTING','OPEN','CLOSING','CLOSED'].forEach(k=>{ try{ window.WebSocket[k]=OrigWS[k]; }catch(e){} });
          } catch(e) {}
        })();` }} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LocaleProvider>
            <ThemeProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
            </ThemeProvider>
          </LocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
