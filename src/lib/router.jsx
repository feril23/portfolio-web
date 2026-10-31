"use client"
// Lightweight navigation shim bridging the app's components to Next.js routing,
// while keeping the GSAP editorial route transition alive on client navigations.
// Also handles locale-prefixed URLs (/id, /en) so Link/navigate build the right
// paths for the active language.
import { defaultLocale, locales } from "../i18n/config.js"
import { getUI } from "../i18n/ui.js"
import { startSharedTextTransition } from "./sharedTextTransition.js"

let _navigate = null
let _prefetch = null
let _curtain = null
let _localeResolver = null
let _locale = defaultLocale

export function bindNavigate(fn) {
  _navigate = fn
}

export function bindPrefetch(fn) {
  _prefetch = fn
}

// Load a route ahead of time so the transition never waits on the server.
export function prefetchRoute(to) {
  try {
    _prefetch?.(withLocale(to))
  } catch {}
}

export function registerCurtain(api) {
  _curtain = api
}

export function registerLocaleResolver(resolver) {
  _localeResolver = typeof resolver === "function" ? resolver : null
}

export function setActiveLocale(locale) {
  if (locale && locales.includes(locale)) _locale = locale
}

export function activeLocale() {
  return _locale
}

export function playTransition(opts) {
  if (_curtain) _curtain.play(opts)
  else opts.go()
}

export function currentPath() {
  return typeof window !== "undefined" ? window.location.pathname : "/" + _locale
}

// Remove a leading /id or /en, returning the logical path ("/", "/blog", …).
export function stripLocale(path) {
  const m = (path || "").match(/^\/(id|en)(?=\/|$)/)
  if (!m) return path || "/"
  const rest = path.slice(m[0].length)
  return rest === "" ? "/" : rest
}

// Add the active locale prefix to a logical site path. Leaves /admin, hash
// links, and already-prefixed paths untouched.
export function withLocale(to) {
  if (!to) return "/" + _locale
  if (to.startsWith("#")) return to
  if (to.startsWith("/admin")) return to
  if (/^\/(id|en)(?=\/|$)/.test(to)) return to
  if (to === "/") return "/" + _locale
  return "/" + _locale + to
}

function labelFor(to) {
  const t = getUI(_locale).curtain
  const logical = stripLocale(to)
  if (!logical || logical === "/") return t.home
  if (logical === "/blog") return t.journal
  if (logical.startsWith("/blog/")) return t.reading
  return ""
}

function routeDepth(path) {
  const logical = stripLocale(path)
  if (logical.startsWith("/blog/")) return 2
  if (logical === "/blog") return 1
  return 0
}

function directionFor(from, to) {
  return routeDepth(to) < routeDepth(from) ? "back" : "forward"
}

export function navigate(to, opts = {}) {
  const target = withLocale(to)
  const from = currentPath()
  if (from === target) return
  const go = () => {
    if (_navigate) _navigate(target)
    else if (typeof window !== "undefined") window.location.assign(target)
  }
  // The dashboard is a separate, client-only surface: navigate instantly with
  // no curtain when either endpoint is under /admin.
  const anyAdmin = from.startsWith("/admin") || target.startsWith("/admin")
  if (anyAdmin || opts.instant) {
    go()
    return
  }
  const label = opts.label != null ? opts.label : labelFor(to)
  playTransition({ label, direction: opts.direction || directionFor(from, target), go })
}

// Switch to another locale while staying on the same logical page.
export async function switchLocale(next) {
  if (!locales.includes(next) || next === _locale) return
  let logical = stripLocale(currentPath())
  if (_localeResolver) {
    try {
      const resolved = await _localeResolver(next)
      if (typeof resolved === "string" && resolved.startsWith("/")) logical = resolved
    } catch {}
  }
  const target = "/" + next + (logical === "/" ? "" : logical)
  const go = () => {
    if (_navigate) _navigate(target)
    else if (typeof window !== "undefined") window.location.assign(target)
  }
  playTransition({ label: getUI(next).lang.name, direction: "locale", go })
}

export function Link({ to, children, onClick, transitionLabel, sharedTitle, ...rest }) {
  const href = withLocale(to)
  const handle = (e) => {
    if (onClick) onClick(e)
    if (e.defaultPrevented) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    if (sharedTitle) {
      const config = typeof sharedTitle === "string" ? { selector: sharedTitle } : sharedTitle
      const source = config?.sourceSelector
        ? document.querySelector(config.sourceSelector)
        : config?.selector
          ? e.currentTarget.querySelector(config.selector)
          : null
      startSharedTextTransition(source, () => navigate(to, { instant: true }), config?.post, config?.direction)
      return
    }
    navigate(to, transitionLabel != null ? { label: transitionLabel } : undefined)
  }
  return (
    <a href={href} onClick={handle} onPointerEnter={() => prefetchRoute(to)} onFocus={() => prefetchRoute(to)} {...rest}>
      {children}
    </a>
  )
}
