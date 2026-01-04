"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";

const STORAGE_KEY = "app-theme";

// Create context FIRST before using it
const ThemeContext = createContext({ theme: "light", setTheme: () => {} });

function normalizeTheme(value, fallback = "light") {
  return value === "dark" || value === "light" ? value : fallback;
}

export function ThemeProvider({ children, defaultTheme = "light" }) {
  const [theme, setTheme] = useState(() => normalizeTheme(defaultTheme, "light"));
  const [hasMounted, setHasMounted] = useState(false);

  // Reconcile stored theme AFTER hydration to avoid server/client render mismatch.
  // This also prevents overwriting the pre-hydration <html> theme script.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light") {
        setTheme(stored);
      }
    } catch {
      /* ignore */
    } finally {
      setHasMounted(true);
    }
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    const root = document.documentElement;
    // Sync explicit theme classes to override prefers-color-scheme media queries
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    
    // Keep data-theme attribute for compatibility
    root.setAttribute("data-theme", theme);
    
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme, hasMounted]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
