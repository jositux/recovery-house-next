import es from "@/locales/es"
import en from "@/locales/en"

export const defaultLocale = "es"
export const locales = ["es", "en"] as const
export type Locale = (typeof locales)[number]

const dictionaries = {
  es,
  en,
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale]
}

export function getTranslations(locale: Locale) {
  return dictionaries[locale]
}

export type Dictionary = typeof es
