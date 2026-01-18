"use client";
import { useTranslations, useLocale } from "next-intl";
import aboutEn from "../../locales/en/about.json";
import aboutAr from "../../locales/ar/about.json";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AboutPageClient() {
  const t = useTranslations("about");
  const ui = useTranslations("ui");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  let values = locale === "ar" ? aboutAr.valuesList : aboutEn.valuesList;
  let stats = locale === "ar" ? aboutAr.stats : aboutEn.stats;
  let techList = locale === "ar" ? aboutAr.techList : aboutEn.techList;

  const router = useRouter();
  const pathname = usePathname();
  // Helper to switch locale in the URL
  const toggleLocale = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    // Replace the first segment (locale) in the path
    const segments = pathname.split("/");
    if (segments[1] === "ar" || segments[1] === "en") {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join("/"));
  };

  return (
    <div
      className="min-h-screen bg-white dark:bg-zinc-950"
      dir={dir}
      lang={locale}
    >
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-end mb-4">
            {/* ...existing code... */}
          </div>
        </div>
      </section>
    </div>
  );
}
