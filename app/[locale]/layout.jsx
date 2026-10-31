import { notFound } from "next/navigation"
import SiteShell from "../../src/site/SiteShell.jsx"
import { locales, isLocale } from "../../src/i18n/config.js"
import { getUIStrings } from "../../src/lib/api.js"
import { mergeUI } from "../../src/i18n/ui.js"

// Pre-render both language shells; unknown locales 404.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  // Interface copy = built-in defaults with the dashboard's per-locale
  // overrides layered on top (resolved on the server).
  let overrides = {}
  try {
    overrides = await getUIStrings(locale)
  } catch {
    overrides = {}
  }
  const ui = mergeUI(locale, overrides)
  return (
    <SiteShell locale={locale} ui={ui}>
      {children}
    </SiteShell>
  )
}
