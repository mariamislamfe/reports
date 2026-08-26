"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setLocale } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n";
import { Icon } from "@/components/ui/icon";

export function TopControls({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [isDark, setIsDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.cookie = `theme=${next ? "dark" : "light"}; path=/; max-age=31536000`;
  }

  function toggleLocale() {
    const next: Locale = locale === "ar" ? "en" : "ar";
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div className="fixed top-16 z-50 flex items-center gap-1.5 rounded-full bg-white/90 p-1 shadow-md ring-1 ring-slate-200 backdrop-blur ltr:right-3 rtl:left-3 dark:bg-slate-800/90 dark:ring-slate-700 md:top-3">
      <button
        type="button"
        onClick={toggleLocale}
        disabled={pending}
        aria-label="Toggle language"
        className="flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <Icon name="globe" className="h-3.5 w-3.5" />
        {locale === "ar" ? "EN" : "AR"}
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <Icon name={isDark ? "sun" : "moon"} className="h-4 w-4" />
      </button>
    </div>
  );
}
