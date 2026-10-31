"use client"
import { useRef, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useAnimations } from "../useAnimations.js"
import { useSiteContent } from "../lib/useSiteData.js"
import { Nav, Footer, BackToTop } from "./Chrome.jsx"
import { Curtain } from "../lib/Curtain.jsx"
import { LocaleProvider } from "../i18n/context.jsx"
import { setActiveLocale } from "../lib/router.jsx"
import { initializeMotionPreference, MOTION_EVENT } from "../lib/motionPreference.js"

// Shared shell for every public page. Stays mounted across client navigations
// (including language switches) so the motion layer and cursor persist while
// the editorial overlay moves between routes.
//
// `ui` is the merged interface copy (defaults + dashboard overrides) resolved
// on the server and handed to the locale context.
export default function SiteShell({ locale, ui, children }) {
  const scope = useRef(null)
  const pathname = usePathname()
  const [motionVersion, setMotionVersion] = useState(0)
  useAnimations(scope, `${pathname}:${motionVersion}`)

  useEffect(() => {
    const refreshMotion = () => setMotionVersion((value) => value + 1)
    window.addEventListener(MOTION_EVENT, refreshMotion)
    initializeMotionPreference()
    return () => window.removeEventListener(MOTION_EVENT, refreshMotion)
  }, [])

  // Keep the navigation shim's locale in sync so Link/navigate build the right
  // /id or /en URLs. Set during render for correct SSR hrefs, and on the client
  // whenever the locale changes (also updates <html lang>).
  setActiveLocale(locale)
  useEffect(() => {
    setActiveLocale(locale)
    if (typeof document !== "undefined") document.documentElement.lang = locale
  }, [locale])

  const content = useSiteContent(locale)

  return (
    <LocaleProvider locale={locale} ui={ui}>
      <div className="site-root" ref={scope}>
        <Nav profile={content.profile} />
        {children}
        <Footer profile={content.profile} />
        <BackToTop />
        <Curtain />
      </div>
    </LocaleProvider>
  )
}
