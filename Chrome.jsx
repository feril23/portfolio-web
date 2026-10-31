import { useEffect, useRef, useState } from "react"
import { Link, navigate, currentPath } from "../lib/router.jsx"

/* ---------- Smooth scroll-to-top helper ----------------------------- */
function scrollToTop() {
  const lenis = typeof window !== "undefined" ? window.__lenis : null
  if (lenis && typeof lenis.scrollTo === "function") {
    lenis.scrollTo(0, { duration: 1.1 })
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
}

/* ---------- Custom cursor (desktop only) ---------------------------- */
export function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return
    let rx = -100, ry = -100, x = -100, y = -100, raf
    const move = (e) => {
      x = e.clientX
      y = e.clientY
      if (dot.current) dot.current.style.transform = `translate(${x}px, ${y}px)`
    }
    const over = (e) => {
      if (e.target.closest("a, button, [data-hover], [data-magnetic]")) {
        ring.current?.classList.add("cursor-ring--active")
      } else {
        ring.current?.classList.remove("cursor-ring--active")
      }
    }
    const loop = () => {
      rx += (x - rx) * 0.15
      ry += (y - ry) * 0.15
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px)`
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener("mousemove", move)
    window.addEventListener("mouseover", over)
    loop()
    return () => {
      window.removeEventListener("mousemove", move)
      window.removeEventListener("mouseover", over)
      cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  )
}

/* ---------- Theme toggle -------------------------------------------- */
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
)
function getTheme() {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark"
}
export function ThemeToggle() {
  const [theme, setTheme] = useState(getTheme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem("theme", theme) } catch (e) {}
  }, [theme])
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"))
  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      data-hover
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

/* ---------- Nav ----------------------------------------------------- */
const NAV_LINKS = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { to: "/blog", label: "Journal" },
  { id: "contact", label: "Contact" },
]

export function Nav({ profile }) {
  const [open, setOpen] = useState(false)

  // Lock background scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  // Close the menu on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  // Navigate to a Home section. When we're on another page (e.g. Journal),
  // the curtain shows the destination section's name (e.g. "Contact") and we
  // glide to it once Home has mounted. When already on Home, just scroll.
  const goToSection = (id, label) => (e) => {
    e.preventDefault()
    setOpen(false)
    const tryScroll = () => {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
        return true
      }
      return false
    }
    if (currentPath() !== "/") {
      navigate("/", { label })
      let tries = 0
      const iv = setInterval(() => {
        if (tryScroll() || ++tries > 45) clearInterval(iv)
      }, 60)
    } else {
      tryScroll()
    }
  }

  const goHome = (e) => {
    e.preventDefault()
    setOpen(false)
    navigate("/")
  }
  const goRoute = (to) => (e) => {
    e.preventDefault()
    setOpen(false)
    navigate(to)
  }

  return (
    <header className={"nav" + (open ? " nav--open" : "")}>
      <div className="container nav-inner">
        <a href="#/" className="nav-brand" data-hover onClick={goHome}>
          {profile?.name || "Portfolio"}
        </a>
        <nav className="nav-links">
          <a href="#work" onClick={goToSection("work", "Work")} data-hover>Work</a>
          <a href="#about" onClick={goToSection("about", "About")} data-hover>About</a>
          <a href="#experience" onClick={goToSection("experience", "Experience")} data-hover>Experience</a>
          <Link to="/blog" data-hover>Journal</Link>
          <a href="#contact" onClick={goToSection("contact", "Contact")} data-hover>Contact</a>
        </nav>
        {profile?.availability && (
          <a className="nav-status" href={`mailto:${profile?.email || ""}`} data-hover>
            <span className="dot" /> {profile.availability}
          </a>
        )}
        <ThemeToggle />
        <button
          className="nav-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          data-hover
        >
          <span />
          <span />
        </button>
      </div>

      {/* Full-screen mobile menu */}
      <div className="nav-menu" aria-hidden={!open}>
        <div className="nav-menu-inner">
          <ol className="nav-menu-list">
            {NAV_LINKS.map((l, i) => (
              <li key={l.label} style={{ "--i": i }}>
                <a
                  href={l.to ? "#" + l.to : "#" + l.id}
                  onClick={l.to ? goRoute(l.to) : goToSection(l.id, l.label)}
                >
                  <span className="nav-menu-index">0{i + 1}</span>
                  <span className="nav-menu-text">{l.label}</span>
                </a>
              </li>
            ))}
          </ol>
          <div className="nav-menu-foot">
            {profile?.availability && (
              <a className="nav-menu-status" href={`mailto:${profile?.email || ""}`}>
                <span className="dot" /> {profile.availability}
              </a>
            )}
            {profile?.socials?.length > 0 && (
              <div className="nav-menu-socials">
                {profile.socials.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

/* ---------- Back to top -------------------------------------------- */
export function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <button
      className={"to-top" + (show ? " to-top--show" : "")}
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      data-hover
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  )
}

/* ---------- Footer --------------------------------------------------- */
export function Footer({ profile }) {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>
          © {new Date().getFullYear()} {profile?.name || ""}
        </span>
        <Link to="/admin" data-hover>Dashboard</Link>
        <a href="#top" data-hover onClick={(e) => { e.preventDefault(); scrollToTop() }}>
          Back to top ↑
        </a>
      </div>
    </footer>
  )
}
