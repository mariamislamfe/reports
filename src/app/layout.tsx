import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, THEME_COOKIE, type Locale } from "@/lib/i18n";
import { TopControls } from "@/components/top-controls";
import "./globals.css";

export const metadata: Metadata = {
  title: "Violation Reports",
  description: "Site violation reporting and PDF generation",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#234ce0",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get(LOCALE_COOKIE)?.value === "en" ? "en" : "ar";
  const theme = cookieStore.get(THEME_COOKIE)?.value === "dark" ? "dark" : "light";

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={theme === "dark" ? "dark" : ""}>
      <body className="min-h-dvh bg-slate-50 font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <TopControls locale={locale} />
        {children}
      </body>
    </html>
  );
}
