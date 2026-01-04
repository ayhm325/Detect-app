"use client";

import React, { createContext, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

export const LocaleContext = createContext();

function getLocaleFromPathname(pathname) {
  if (typeof pathname !== "string") return "ar";
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  if (pathname === "/ar" || pathname.startsWith("/ar/")) return "ar";
  return "ar";
}

function replaceLocaleInPath(pathname, newLocale) {
  const safeNewLocale = newLocale === "en" ? "en" : "ar";
  const safePath = typeof pathname === "string" ? pathname : "/";
  const currentLocale = getLocaleFromPathname(safePath);

  if (safePath === `/${currentLocale}`) return `/${safeNewLocale}`;
  if (safePath.startsWith(`/${currentLocale}/`)) {
    return `/${safeNewLocale}${safePath.slice(currentLocale.length + 1)}`;
  }

  // Path without a locale prefix
  if (safePath === "/") return `/${safeNewLocale}`;
  return `/${safeNewLocale}${safePath.startsWith("/") ? "" : "/"}${safePath}`;
}

export function LocaleProvider({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = getLocaleFromPathname(pathname);

  // Toggle language function
  const toggleLocale = useCallback(() => {
    const newLocale = currentLocale === "en" ? "ar" : "en";
    router.push(replaceLocaleInPath(pathname, newLocale));
  }, [pathname, currentLocale, router]);

  // Change to specific locale
  const setLocale = useCallback(
    (locale) => {
      if (locale === currentLocale) return;
      router.push(replaceLocaleInPath(pathname, locale));
    },
    [pathname, currentLocale, router]
  );

  const value = {
    locale: currentLocale,
    toggleLocale,
    setLocale,
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}
