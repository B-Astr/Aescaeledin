import type es from './es'

export type Locales = 'es' | 'en'

export type Translation = typeof es

type ToFunctions<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? ToFunctions<T[K]>
    : (...args: unknown[]) => string
}

export type TranslationFunctions = ToFunctions<Translation>
