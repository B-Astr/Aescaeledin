import React, { createContext, useContext, useState } from 'react'
import { i18nObject } from 'typesafe-i18n'
import type { Locales, TranslationFunctions } from './i18n-types'
import { loadedLocales } from './i18n-util'

type I18nContextType = {
  LL: TranslationFunctions
  locale: Locales
  setLocale: (locale: Locales) => void
}

const I18nContext = createContext<I18nContextType>({} as I18nContextType)

export function TypesafeI18n({
  initialLocale,
  children,
}: {
  initialLocale: Locales
  children: React.ReactNode
}) {
  const [locale, setLocaleState] = useState<Locales>(initialLocale)

  function setLocale(next: Locales) {
    localStorage.setItem('locale', next)
    setLocaleState(next)
  }

  const LL = i18nObject(locale, loadedLocales[locale], {},) as unknown as TranslationFunctions

  return (
    <I18nContext.Provider value={{ LL, locale, setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18nContext() {
  return useContext(I18nContext)
}
