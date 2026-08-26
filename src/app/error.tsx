"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";

// Error boundaries must be Client Components and can't rely on the same
// server-rendered dictionary the rest of the app uses (whatever broke may
// have broken that too) — read the locale straight off <html lang> instead.
const COPY = {
  en: {
    title: "Something went wrong",
    description: "An unexpected error occurred. You can try again, or go back to the dashboard.",
    retry: "Try again",
    backHome: "Back to Dashboard",
  },
  ar: {
    title: "حصل خطأ غير متوقع",
    description: "حصل خطأ غير متوقع. تقدري تجربي تاني، أو ترجعي للرئيسية.",
    retry: "حاول تاني",
    backHome: "رجوع للرئيسية",
  },
};

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  const [locale, setLocale] = useState<"en" | "ar">("ar");

  useEffect(() => {
    setLocale(document.documentElement.lang === "en" ? "en" : "ar");
    console.error(error);
  }, [error]);

  const t = COPY[locale];

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400">
        <Icon name="warning" className="h-7 w-7" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t.title}</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">{t.description}</p>
      <div className="mt-6 flex gap-2">
        <button type="button" onClick={reset} className="btn-primary">
          {t.retry}
        </button>
        <a href="/dashboard" className="btn-secondary">
          {t.backHome}
        </a>
      </div>
    </div>
  );
}
