import { redirect } from "next/navigation"
import { defaultLocale } from "../src/i18n/config.js"

// The site is locale-prefixed; send the bare root to the default language.
export default function RootPage() {
  redirect(`/${defaultLocale}`)
}
