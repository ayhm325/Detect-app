import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-red-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <h1 className="text-[150px] md:text-[200px] font-black bg-gradient-to-r from-yellow-400 via-red-400 to-red-600 bg-clip-text text-transparent leading-none opacity-20">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-32 h-32 text-yellow-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent mb-4">
          الصفحة غير موجودة
        </h2>
        
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى موقع آخر.
        </p>

        {/* Popular Links */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">
            الصفحات الشائعة:
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "الرئيسية", href: "/" },
              { label: "تسجيل الدخول", href: "/login" },
              { label: "إنشاء حساب", href: "/signup" },
              { label: "تواصل معنا", href: "/contact" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-semibold hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Back Home Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-yellow-500 via-red-500 to-red-600 hover:from-yellow-600 hover:via-red-600 hover:to-red-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          العودة للصفحة الرئيسية
        </Link>

        {/* Search Suggestion */}
        <p className="mt-8 text-sm text-gray-600 dark:text-gray-400">
          أو يمكنك البحث عما تريد في{" "}
          <Link href="/" className="text-yellow-600 dark:text-yellow-400 hover:underline font-semibold">
            الصفحة الرئيسية
          </Link>
        </p>
      </div>
    </div>
  );
}
