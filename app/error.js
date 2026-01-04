"use client";

import { useEffect } from "react";
import useLocale from "./hooks/useLocale";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Error({ error, reset }) {
  const tr = useTranslations("rootError");

  useEffect(() => {
    // Log the error to an error reporting service
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  const { locale } = useLocale();
  const withLocale = (path) => {
    const base = path.startsWith("/") ? path : `/${path}`;
    if (base.startsWith("/en") || base.startsWith("/ar")) return base;
    return `/${locale}${base === "/" ? "" : base}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-2xl w-full text-center card-glass px-6 py-10">
        {/* Error Icon */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 bg-(--ui-muted) rounded-full animate-pulse blur-xl" />
          <div className="absolute inset-0 brand-gradient rounded-full flex items-center justify-center">
            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl md:text-5xl font-black brand-gradient-text mb-4">
          {tr("title")}
        </h1>
        
        <p className="text-lg text-(--ui-muted-2) mb-8">
          {error.message || tr("fallbackMessage")}
        </p>

        {/* Error Details (Dev Mode) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 rounded-lg border border-(--ui-border) text-left overflow-auto max-h-40 bg-(--ui-surface-2)">
            <pre className="text-xs text-foreground">
              {error.stack}
            </pre>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-8 py-3 btn-gradient font-bold rounded-full transition-all duration-300"
          >
            {tr("retry")}
          </button>
          
          <Link
            href={withLocale("/")}
            className="px-8 py-3 card-glass border border-(--ui-border) text-foreground font-bold rounded-full transition-all duration-300"
          >
            {tr("backHome")}
          </Link>
        </div>

        {/* Support Link */}
        <p className="mt-8 text-sm text-(--ui-muted-2)">
          {tr("supportPrefix")} {" "}
          <Link href={withLocale("/contact")} className="brand-gradient-text hover:underline font-semibold">
            {tr("contactUs")}
          </Link>
        </p>
      </div>
    </div>
  );
}
