"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";

// المفتاح المستخدم في Local Storage لتخزين التيم
const STORAGE_KEY = "app-theme";

// إنشاء Context مع القيمة الافتراضية
const ThemeContext = createContext({
  theme: "light",      // التيم الحالي
  setTheme: () => {},  // دالة لتغيير التيم
});

// دالة مساعدة للتحقق من صلاحية القيمة وإرجاع قيمة افتراضية إذا كانت غير صالحة
function normalizeTheme(value, fallback = "light") {
  return value === "dark" || value === "light" ? value : fallback;
}

/**
 * ThemeProvider - يلف التطبيق لتوفير Theme Context
 * @param {React.ReactNode} children - عناصر التطبيق
 * @param {string} defaultTheme - القيمة الافتراضية للتيم (light أو dark)
 */
export function ThemeProvider({ children, defaultTheme = "light" }) {
  // الحالة الحالية للتيم
  const [theme, setTheme] = useState(() =>
    normalizeTheme(defaultTheme, "light")
  );

  // حالة للتأكد أن المكون تم تركيبه على المتصفح لتجنب مشاكل SSR
  const [hasMounted, setHasMounted] = useState(false);

  // استرجاع التيم المخزن في LocalStorage بعد تركيبه على العميل
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light") {
        setTheme(stored);
      }
    } catch {
      // تجاهل أي أخطاء أثناء الوصول للـ LocalStorage
    } finally {
      setHasMounted(true);
    }
  }, []);

  // مزامنة التيم مع الـ <html> بعد التركيب أو تغيير التيم
  useEffect(() => {
    if (!hasMounted) return;

    const root = document.documentElement;

    // مزامنة الكلاسات لتجاوز media query
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }

    // الاحتفاظ بصفة data-theme لتوافق بعض المكتبات
    root.setAttribute("data-theme", theme);

    // تخزين التيم في LocalStorage
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // تجاهل أي أخطاء
    }
  }, [theme, hasMounted]);

  // استخدام useMemo لتحسين الأداء وعدم إعادة إنشاء القيمة إلا عند تغيير التيم
  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * useTheme - هوك لاستهلاك Theme Context بسهولة
 */
export function useTheme() {
  return useContext(ThemeContext);
}
