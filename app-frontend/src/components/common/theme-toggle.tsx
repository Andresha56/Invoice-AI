import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "invoice-ai.theme";
type Theme = "light" | "dark";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-900">
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-label="Light mode"
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${theme === "light" ? "bg-white text-amber-500 shadow-sm dark:bg-slate-800" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"}`}
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-label="Dark mode"
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${theme === "dark" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"}`}
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
};
