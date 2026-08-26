import "server-only";
import { cookies } from "next/headers";
import { getDictionary, LOCALE_COOKIE, type Locale } from "./index";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : "ar";
}

export async function getServerDictionary() {
  const locale = await getLocale();
  return { locale, dict: getDictionary(locale) };
}
