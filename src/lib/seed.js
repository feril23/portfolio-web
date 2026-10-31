import { getData } from "../data.js"

// Shape the bundled seed into the structure the site expects, for a given
// locale. Kept free of any "use client" directive so server components (e.g. the
// home route) can import it as a fallback when Supabase is not configured.
export function seedSiteContent(locale) {
  return getData(locale)
}
