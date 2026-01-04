import React from 'react';
import "./globals.css";
import { ToastProvider } from "./components/ui/ToastProvider";

import { geistSans, geistMono } from "./fonts";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Detect AI - AI-powered medical imaging analysis",
  description:
    "An AI system for medical image analysis with fast results and high accuracy.",
  keywords: ["AI", "medical imaging", "diagnosis", "X-ray", "analysis", "health"],
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
    title: "Detect AI - AI-powered medical imaging analysis",
    description: "An AI system for medical image analysis.",
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
    title: "Detect AI - AI-powered medical imaging analysis",
    description: "An AI system for medical image analysis.",
    images: ["/twitter-image.jpg"],
  },
};


export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  };
}


import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { LocaleProvider } from "./contexts/LocaleContext";
import { ThemeProvider } from "./theme-provider";

export default async function RootLayout({ children, params }) {
  const locale = await getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const messages = await getMessages();
  return (
    <html suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`} lang={locale} dir={dir} data-scroll-behavior="smooth">
      <body>
        <script dangerouslySetInnerHTML={{ __html: `(function(){
          try {
            if (typeof window === 'undefined' || typeof document === 'undefined') return;
            var key = 'app-theme';
            var theme = 'light';
            try {
              var stored = window.localStorage.getItem(key);
              if (stored === 'dark' || stored === 'light') theme = stored;
            } catch (e) {}

            var root = document.documentElement;
            root.classList.remove('dark');
            root.classList.remove('light');
            root.classList.add(theme);
            root.setAttribute('data-theme', theme);
          } catch (e) {}
        })();` }} />
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

        <script dangerouslySetInnerHTML={{ __html: `(function(){
          try {
            if (typeof window === 'undefined' || typeof document === 'undefined') return;

            const root = document.documentElement;
            const readVar = (name) => {
              try { return getComputedStyle(root).getPropertyValue(name).trim(); } catch (e) { return ''; }
            };
            const resolveVar = (...names) => {
              for (const name of names) {
                const value = readVar(name);
                if (value) return value;
              }
              return '';
            };
            const ensureThemeMeta = (media) => {
              let el = document.querySelector('meta[name="theme-color"][media="' + media + '"]');
              if (!el) {
                el = document.createElement('meta');
                el.setAttribute('name', 'theme-color');
                el.setAttribute('media', media);
                document.head.appendChild(el);
              }
              return el;
            };

            const applyThemeColors = () => {
              const light = resolveVar('--color-bright-500', '--color-bright', '--color-primary-500', '--color-primary');
              const dark = resolveVar('--color-background-dark', '--color-neutral', '--color-background');

              if (light) ensureThemeMeta('(prefers-color-scheme: light)').setAttribute('content', light);
              if (dark) ensureThemeMeta('(prefers-color-scheme: dark)').setAttribute('content', dark);
            };

            const applyColorInputs = (scope) => {
              const container = scope && scope.querySelectorAll ? scope : document;
              const inputs = container.querySelectorAll('input[type="color"][data-token-default]');
              inputs.forEach((input) => {
                const token = input.getAttribute('data-token-default');
                if (!token) return;
                const value = resolveVar(token);
                if (value) input.value = value;
              });
            };

            applyThemeColors();
            applyColorInputs(document);

            const mqlLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)');
            const mqlDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
            [mqlLight, mqlDark].forEach((mql) => {
              if (!mql) return;
              if (mql.addEventListener) mql.addEventListener('change', applyThemeColors);
              else if (mql.addListener) mql.addListener(applyThemeColors);
            });

            const observer = new MutationObserver((mutations) => {
              for (const mutation of mutations) {
                for (const node of mutation.addedNodes || []) {
                  if (!node || node.nodeType !== 1) continue;
                  applyColorInputs(node);
                }
              }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
          } catch (e) {}
        })();` }} />
      </body>
    </html>
  );
}
