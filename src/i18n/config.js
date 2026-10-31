// Locale configuration shared by server and client code.
export const locales = ["id", "en"]
export const defaultLocale = "id"

export function isLocale(value) {
  return locales.includes(value)
}
