"use client"
import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import {
  Link,
  navigate,
  currentPath,
  switchLocale,
  withLocale,
  stripLocale,
} from "../lib/router.jsx"
import { useUI, useLocale } from "../i18n/context.jsx"
import { locales } from "../i18n/config.js"
import { getUI } from "../i18n/ui.js"
import { isMotionReduced, setMotionEnabled } from "../lib/motionPreference.js"

/* ----------------------------- Custom cursor ---------------------------- */
export function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.matchMedia("(pointer: coarse)").matches) return
    const d = dot.current
    const r = ring.current
    if (!d || !r) return
    let rx = 0, ry = 0, mx = 0, my = 0
    let raf = 0
    const onMove = (e) => {
      mx = e.clientX
      my = e.clientY
      d.style.transform = `translate(${mx}px, ${my}px)`
    }
    const loop = () => {
      rx += (mx - rx) * 0.15
      ry += (my - ry) * 0.15
      r.style.transform = `translate(${rx}px, ${ry}px)`
      raf = requestAnimationFrame(loop)
    }
    const over = (e) => {
      if (e.target.closest("[data-hover]")) r.classList.add("is-hover")
    }
    const out = (e) => {
      if (e.target.closest("[data-hover]")) r.classList.remove("is-hover")
    }
    window.addEventListener("mousemove", onMove)
    document.addEventListener("mouseover", over)
    document.addEventListener("mouseout", out)
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseover", over)
      document.removeEventListener("mouseout", out)
      cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <>
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
      <div className="cursor-ring" ref={ring} aria-hidden="true" />
    </>
  )
}

/* -------------------------------- Icons --------------------------------- */
function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}

/* ---------------------------- Theme toggle ------------------------------ */
function getTheme() {
  if (typeof document === "undefined") return "dark"
  return document.documentElement.dataset.theme === "light" ? "light" : "dark"
}

function ThemeToggle() {
  const t = useUI()
  const [theme, setTheme] = useState(null)
  useEffect(() => {
    setTheme(getTheme())
  }, [])
  const toggle = () => {
    const next = getTheme() === "light" ? "dark" : "light"
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem("theme", next)
    } catch {}
    setTheme(next)
  }
  const label = theme === "light" ? t.theme.toDark : t.theme.toLight
  return (
    <button className="theme-toggle" onClick={toggle} aria-label={label} title={label} data-hover>
      {theme === "light" ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}

/* ------------------------- Accessibility menu --------------------------- */
function AccessibilityIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4.5" r="2" />
      <path d="M5 8.5c4.7 1.5 9.3 1.5 14 0M12 7.5v5.2M8.5 21l3.5-8.3 3.5 8.3M7.5 14.5l4.5-1.8 4.5 1.8" />
    </svg>
  )
}

function AccessibilityMenu() {
  const t = useUI()
  const ref = useRef(null)
  const [open, setOpen] = useState(false)
  const [motionEnabled, setMotionState] = useState(true)

  useEffect(() => {
    setMotionState(!isMotionReduced())
  }, [])

  useEffect(() => {
    if (!open) return
    const close = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", close)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", close)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const toggleMotion = () => {
    const next = !motionEnabled
    setMotionState(next)
    setMotionEnabled(next)
  }

  return (
    <div className={"a11y-menu-wrap" + (open ? " is-open" : "")} ref={ref}>
      <button
        type="button"
        className="a11y-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-label={t.accessibility.open}
        title={t.accessibility.open}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="accessibility-menu"
        data-hover
      >
        <AccessibilityIcon />
      </button>
      <div id="accessibility-menu" className="a11y-popover" role="dialog" aria-label={t.accessibility.title}>
        <div className="a11y-popover-head">
          <strong>{t.accessibility.title}</strong>
          <button type="button" onClick={() => setOpen(false)} aria-label={t.a11y.closeMenu}>×</button>
        </div>
        <div className="a11y-setting">
          <div>
            <strong>{t.accessibility.motion}</strong>
            <p>{t.accessibility.motionDesc}</p>
          </div>
          <button
            type="button"
            className={"a11y-switch" + (motionEnabled ? " is-on" : "")}
            role="switch"
            aria-checked={motionEnabled}
            onClick={toggleMotion}
          >
            <span aria-hidden="true" />
            <em>{motionEnabled ? t.accessibility.enabled : t.accessibility.disabled}</em>
          </button>
        </div>
      </div>
    </div>
  )
}

/* -------------------------- Language dropdown --------------------------- */
function GlobeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.9 2.6 15.1 0 18M12 3c-2.6 2.9-2.6 15.1 0 18" strokeLinecap="round" />
    </svg>
  )
}
function CaretIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function LanguageDropdown() {
  const active = useLocale()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDoc)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const choose = (lc) => {
    setOpen(false)
    if (lc !== active) switchLocale(lc)
  }

  return (
    <div className={"lang-dd" + (open ? " is-open" : "")} ref={ref}>
      <button
        type="button"
        className="lang-dd-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={getUI(active).lang.name}
        data-hover
      >
        <span className="lang-dd-globe" aria-hidden="true">
          <GlobeIcon />
        </span>
        <span className="lang-dd-current">{active.toUpperCase()}</span>
        <span className="lang-dd-caret" aria-hidden="true">
          <CaretIcon />
        </span>
      </button>
      <div className="lang-dd-menu" role="listbox">
        {locales.map((lc) => (
          <button
            key={lc}
            type="button"
            role="option"
            aria-selected={lc === active}
            className={"lang-dd-item" + (lc === active ? " is-active" : "")}
            onClick={() => choose(lc)}
            data-hover
          >
            <span className="lang-dd-code">{lc.toUpperCase()}</span>
            <span className="lang-dd-name">{getUI(lc).lang.name}</span>
            {lc === active && <span className="lang-dd-dot" aria-hidden="true" />}
          </button>
        ))}
      </div>
    </div>
  )
}

/* --------------------------------- Nav ---------------------------------- */
export function Nav({ profile }) {
  const t = useUI()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [activeNav, setActiveNav] = useState("")
  const NAV_LINKS = [
    { id: "about", label: t.nav.about },
    { id: "services", label: t.nav.services },
    { id: "work", label: t.nav.work },
    { id: "experience", label: t.nav.experience },
    { to: "/blog", label: t.nav.journal },
    { id: "contact", label: t.nav.contact },
  ]

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    const logical = stripLocale(pathname)
    if (logical.startsWith("/blog")) {
      setActiveNav("journal")
      return
    }
    if (logical !== "/") {
      setActiveNav("")
      return
    }

    const ids = ["about", "services", "work", "experience", "journal", "contact"]
    let raf = 0
    const update = () => {
      raf = 0
      const readingLine = window.innerHeight * 0.38
      let current = ""
      for (const id of ids) {
        const element = document.getElementById(id)
        if (!element) continue
        const rect = element.getBoundingClientRect()
        if (rect.top <= readingLine && rect.bottom > readingLine) current = id
      }
      setActiveNav((previous) => previous === current ? previous : current)
    }
    const requestUpdate = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", requestUpdate, { passive: true })
    window.addEventListener("resize", requestUpdate)
    return () => {
      window.removeEventListener("scroll", requestUpdate)
      window.removeEventListener("resize", requestUpdate)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [pathname])

  const isActive = (link) => link.to ? activeNav === "journal" : activeNav === link.id

  // Scroll to an on-page section; if we're not on the home route, navigate
  // there first and then poll for the target element.
  const goToSection = (id, transitionLabel) => {
    setOpen(false)
    const onHome = stripLocale(currentPath()) === "/"
    const scroll = () => {
      let tries = 0
      const tick = () => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: isMotionReduced() ? "auto" : "smooth" })
        } else if (tries++ < 45) {
          setTimeout(tick, 60)
        }
      }
      tick()
    }
    if (onHome) {
      scroll()
    } else {
      navigate("/", { label: transitionLabel })
      setTimeout(scroll, 650)
    }
  }

  return (
    <>
      <header className={"nav" + (open ? " nav--open" : "")}>
        <div className="container nav-inner">
          <a
            className="nav-brand"
            href={withLocale("/")}
            onClick={(e) => {
              e.preventDefault()
              setOpen(false)
              navigate("/")
            }}
            data-hover
          >
            <span className="nav-name">{profile?.name}</span>
          </a>

          <nav className="nav-links">
            {NAV_LINKS.map((l) =>
              l.to ? (
                <Link key={l.label} to={l.to} transitionLabel={l.label} className={"nav-link" + (isActive(l) ? " is-active" : "")} aria-current={isActive(l) ? "page" : undefined} data-hover>
                  {l.label}
                </Link>
              ) : (
                <button key={l.label} className={"nav-link" + (isActive(l) ? " is-active" : "")} aria-current={isActive(l) ? "location" : undefined} onClick={() => goToSection(l.id, l.label)} data-hover>
                  {l.label}
                </button>
              )
            )}
          </nav>

          <div className="nav-right">
            {profile?.availability && (
              <span className="nav-status">
                <span className="nav-status-dot" />
                {profile.availability}
              </span>
            )}
            <LanguageDropdown />
            <AccessibilityMenu />
            <ThemeToggle />
            <button
              className={"nav-toggle" + (open ? " is-open" : "")}
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? t.a11y.closeMenu : t.a11y.openMenu}
              aria-expanded={open}
              data-hover
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={"nav-menu" + (open ? " is-open" : "")}>
        <div className="nav-menu-inner">
          <nav className="nav-menu-links">
            {NAV_LINKS.map((l, i) =>
              l.to ? (
                <a
                  key={l.label}
                  href={withLocale(l.to)}
                  className={"nav-menu-link" + (isActive(l) ? " is-active" : "")}
                  aria-current={isActive(l) ? "page" : undefined}
                  style={{ "--i": i }}
                  onClick={(e) => {
                    e.preventDefault()
                    setOpen(false)
                    navigate(l.to, { label: l.label })
                  }}
                  data-hover
                >
                  {l.label}
                </a>
              ) : (
                <button
                  key={l.label}
                  className={"nav-menu-link" + (isActive(l) ? " is-active" : "")}
                  aria-current={isActive(l) ? "location" : undefined}
                  style={{ "--i": i }}
                  onClick={() => goToSection(l.id, l.label)}
                  data-hover
                >
                  {l.label}
                </button>
              )
            )}
          </nav>
          <div className="nav-menu-foot">
            <LanguageDropdown />
            {profile?.email && (
              <a className="nav-menu-email" href={`mailto:${profile.email}`} data-hover>
                {profile.email}
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

/* ------------------------------ Back to top ----------------------------- */
export function BackToTop() {
  const t = useUI()
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  const toTop = () => {
    if (window.__lenis && !isMotionReduced()) window.__lenis.scrollTo(0, { duration: 1.1 })
    else window.scrollTo({ top: 0, behavior: isMotionReduced() ? "auto" : "smooth" })
  }
  return (
    <button
      className={"back-to-top" + (show ? " is-visible" : "")}
      onClick={toTop}
      aria-label={t.a11y.backToTop}
      title={t.a11y.backToTop}
      data-hover
    >
      ↑
    </button>
  )
}

/* -------------------------------- Footer -------------------------------- */
export function Footer({ profile }) {
  const t = useUI()
  const toTop = (e) => {
    e.preventDefault()
    if (window.__lenis && !isMotionReduced()) window.__lenis.scrollTo(0, { duration: 1.1 })
    else window.scrollTo({ top: 0, behavior: isMotionReduced() ? "auto" : "smooth" })
  }
  return (
    <footer className="footer">
      <div className="container footer-inner">
	<span>
           © {new Date().getFullYear()} {profile?.name}
        </span>
        <a href="#top" className="footer-top-link" onClick={toTop} data-hover>
            {t.footer.backToTop}
        </a>
      </div>
    </footer>
  )
}
