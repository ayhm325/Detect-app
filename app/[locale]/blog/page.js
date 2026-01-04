"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

export default function BlogPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("blog");
  const ui = useTranslations("ui");
  const placeholder = ui("placeholder");

  const posts = t.raw("posts");

  const safeText = (value) => {
    const v = String(value || "").trim();
    return v ? v : placeholder;
  };

  const toggleLocale = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    router.push(`/${newLocale}/blog`);
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center py-20"
      style={{
        backgroundImage: 'url(/icons/blog.jpg)',
      }}
    >
      <div className="card-glass relative z-10 mx-auto w-full max-w-4xl rounded-3xl border border-(--ui-border) bg-(--ui-surface)/60 p-8 px-4 backdrop-blur-md shadow-(--shadow-lift)">
        <div className="mb-4 flex justify-end">
          <button
            onClick={toggleLocale}
            className="rounded-full bg-(--ui-surface-2) px-4 py-2 font-semibold text-(--ui-foreground) shadow-(--shadow-soft) transition-colors hover:bg-(--ui-surface)"
            aria-label={t("languageToggleAria")}
          >
            {t("languageToggleLabel")}
          </button>
        </div>
        <h1 className="mb-6 text-center text-4xl font-bold text-(--ui-warning)">{t("title")}</h1>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-(--ui-muted-foreground)">
          {t("description")}
        </p>
        <div className="mb-12 grid gap-8">
          {posts.map((post, idx) => (
            <div
              key={idx}
              className="card-glass animate-fadeIn rounded-2xl border border-(--ui-border) bg-(--ui-surface)/60 p-6 backdrop-blur-sm shadow-(--shadow-soft) transition-transform hover:scale-[1.02]"
            >
              <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between">
                <h2 className="mb-2 text-2xl font-bold text-(--ui-warning) md:mb-0">{safeText(post?.title)}</h2>
                <span className="text-sm text-(--ui-muted-foreground)">{safeText(post?.date)}</span>
              </div>
              <p className="mb-2 text-sm text-(--ui-muted-foreground)">{safeText(post?.excerpt)}</p>
              <button className="cursor-not-allowed font-semibold text-(--ui-warning) hover:underline" disabled>
                {t("comingSoon")}
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Link
            href={`/${locale}`}
            className="inline-block rounded-full bg-(--ui-warning) px-6 py-3 font-semibold text-(--ui-warning-foreground) shadow-(--shadow-soft) transition-opacity hover:opacity-90"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
