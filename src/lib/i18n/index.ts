import en, { type Dictionary } from "./dictionaries/en";
import ar from "./dictionaries/ar";

export type Locale = "en" | "ar";
export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { en, ar };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

export const LOCALE_COOKIE = "locale";
export const THEME_COOKIE = "theme";
