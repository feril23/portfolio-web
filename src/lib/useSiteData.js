"use client"
import { useEffect, useState } from "react"
import { seedSiteContent } from "./seed.js"
import { getSiteContent } from "./api.js"

// Renders instantly with bundled seed content for the active locale, then swaps
// in live Supabase content once the async fetch resolves. Re-runs when the
// locale changes so the seed fallback stays localized.
export function useSiteContent(locale) {
  const [data, setData] = useState(() => seedSiteContent(locale))
  useEffect(() => {
    let alive = true
    setData(seedSiteContent(locale))
    getSiteContent(locale)
      .then((d) => {
        if (alive && d && d.profile) setData(d)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [locale])
  return data
}
