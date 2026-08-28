import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

const THEME_KEY = "app_theme";

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true); // default dark

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved !== null) setIsDark(saved === "dark");
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}