"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

export default function ServicesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("services");
  const services = t.raw("list") || [];

  const toggleLocale = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    const segments = pathname.split("/");
    if (segments[1] === "ar" || segments[1] === "en") {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join("/"));
  };

  return (
    <div className="min-h-screen bg-(--ui-surface) text-(--ui-foreground) py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleLocale}
            className="px-4 py-2 rounded-full border border-(--ui-border) bg-(--ui-surface) text-(--ui-foreground) font-semibold hover:bg-(--ui-surface-2)/60 transition-colors"
            aria-label={t("languageToggleAria")}
          >
            {t("languageToggleLabel")}
          </button>
        </div>
        <h1 className="text-4xl font-bold mb-6 text-center brand-gradient-text">{t("title")}</h1>
        <p className="text-lg text-(--ui-muted-foreground) mb-12 text-center max-w-2xl mx-auto">
          {t("description")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="card-glass rounded-3xl p-10 border border-(--ui-border) flex flex-col items-center text-center hover:bg-(--ui-surface-2)/60 transition-colors animate-fadeIn min-h-65"
              style={{ minWidth: 0 }}
            >
              {/* يمكنك إضافة أيقونات ثابتة أو حسب idx هنا */}
              <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-(--ui-foreground)">{service.name}</h2>
              <p className="text-(--ui-muted-foreground) text-lg md:text-xl font-medium leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Link
            href={`/${locale}`}
            className="inline-block px-6 py-3 rounded-full btn-gradient font-semibold"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
