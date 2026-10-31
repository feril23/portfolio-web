"use client"
import { createContext, useContext } from "react"
import { getUI } from "./ui.js"
import { defaultLocale } from "./config.js"

const LocaleContext = createContext({ locale: defaultLocale, t: getUI(defaultLocale) })

// `ui` is the merged interface copy resolved on the server (defaults + the
// dashboard's per-locale overrides). If omitted we fall back to the built-in
// defaults for the locale.
export function LocaleProvider({ locale, ui, children }) {
  const value = { locale, t: ui || getUI(locale) }
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  return useContext(LocaleContext).locale
}

export function useUI() {
  return useContext(LocaleContext).t
}
