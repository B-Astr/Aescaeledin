import type { Locales, Translation } from './i18n-types'
import es from './es'
import en from './en'

export const locales: Locales[] = ['es', 'en']

export const loadedLocales: Record<Locales, Translation> = { es, en }

export function detectLocale(): Locales {
  const stored = localStorage.getItem('locale') as Locales | null
  if (stored && locales.includes(stored)) return stored
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en'
}
