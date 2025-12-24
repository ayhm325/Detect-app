"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { withLocale } from "../../i18n/routing";

export default function PatientSidebar({ open = true, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("patientSidebar");
  // ...existing code...
  // Use t("key") for all navigation labels
  const items = [
    { href: withLocale("/patient/dashboard"), label: t("dashboard"), icon: "🏠" },
    { href: withLocale("/patient/appointments"), label: t("appointments"), icon: "📅" },
    { href: withLocale("/patient/results"), label: t("results"), icon: "📄" },
    { href: withLocale("/patient/chat"), label: t("chat"), icon: "💬" },
    { href: withLocale("/patient/profile"), label: t("profile"), icon: "👤" },
    { href: "__logout__", label: t("logout"), icon: "🚪" },
  ];
  return (
    <>
      {/* شريط جانبي دائم على الشاشات الكبيرة */}
      <aside className="sticky top-4 hidden w-72 shrink-0 rounded-xl border border-gray-200 bg-white/70 p-4 shadow-sm lg:block">
        <div className="mb-6 flex items-center justify-center">
          <span className="text-2xl font-bold text-blue-700 tracking-wide whitespace-nowrap">PneumoDetect</span>
        </div>
        <nav className="space-y-1">
          {items.map((item) => {
            const active = pathname?.startsWith(item.href);
            if (item.href === "__logout__") {
              return (
                <button
                  key="logout"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-100"
                  onClick={() => router.push(withLocale("/patient/logout"))}
                >
                  <span aria-hidden>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  active ? "bg-blue-50 text-blue-700" : "text-gray-900 hover:bg-gray-100"
                }`}
              >
                <span aria-hidden>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* شريط جانبي كـ Overlay على الشاشات الصغيرة */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-72 rounded-l-xl border border-gray-200 bg-white/90 p-4 shadow-lg transition-transform lg:hidden`}
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="mb-6 flex items-center justify-center">
          <span className="text-2xl font-bold text-blue-700 tracking-wide whitespace-nowrap">PneumoDetect</span>
        </div>
        <nav className="space-y-1">
          {items.map((item) => {
            const active = pathname?.startsWith(item.href);
            if (item.href === "__logout__") {
              return (
                <button
                  key="logout"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-100"
                  onClick={() => {
                    router.push(`${basePrefix}/patient/logout`);
                    onClose?.();
                  }}
                >
                  <span aria-hidden>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  active ? "bg-blue-50 text-blue-700" : "text-gray-900 hover:bg-gray-100"
                }`}
                onClick={onClose}
              >
                <span aria-hidden>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
