"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import arBlog from "../../locales/ar/blog.json";
import enBlog from "../../locales/en/blog.json";

export default function BlogPage() {
  const router = useRouter();
  const pathname = usePathname();
  // Detect locale from path
  const locale = pathname.split("/")[1] === "ar" ? "ar" : "en";
  const t = locale === "ar" ? arBlog : enBlog;
  const posts = t.posts || [];
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
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center py-20"
      style={{
        backgroundImage: 'url(/icons/blog.jpg)',
      }}
    >
      <div className="w-full max-w-4xl mx-auto px-4 p-8 rounded-3xl shadow-2xl backdrop-blur-md bg-white/60 dark:bg-zinc-900/60 border border-white/30 dark:border-zinc-700/40 relative z-10">
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleLocale}
            className="px-4 py-2 rounded-full bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-gray-100 font-semibold shadow hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors"
            aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          >
            {locale === "ar" ? "English" : "العربية"}
          </button>
        </div>
        <h1 className="text-4xl font-bold mb-6 text-yellow-600 dark:text-yellow-300 text-center">{t.title}</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 text-center max-w-2xl mx-auto">
          {t.description}
        </p>
        <div className="grid gap-8 mb-12">
          {posts.map((post, idx) => (
            <div key={idx} className="bg-yellow-50/60 dark:bg-zinc-800/60 rounded-2xl p-6 shadow-lg hover:scale-[1.02] transition-transform animate-fadeIn backdrop-blur-sm border border-white/20 dark:border-zinc-700/30">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <h2 className="text-2xl font-bold text-yellow-700 dark:text-yellow-200 mb-2 md:mb-0">{post.title}</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">{post.date}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{post.excerpt}</p>
              <button className="text-yellow-600 dark:text-yellow-300 font-semibold hover:underline cursor-not-allowed" disabled>
                قريباً
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Link
            href="/ar"
            className="inline-block px-6 py-3 rounded-full bg-yellow-500 text-white font-semibold shadow-md hover:bg-yellow-600 transition-colors"
          >
            العودة إلى الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
