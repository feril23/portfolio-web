"use client"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { DEMO, auth, getProfile } from "../../src/lib/api.js"
import { Link } from "../../src/lib/router.jsx"
import { ToastProvider, Icons, Spinner, ChromeCtx } from "../../src/admin/ui.jsx"
import Login from "../../src/admin/Login.jsx"
import {
  AdminLocaleProvider,
  AdminLocaleSwitcher,
  useAdminLocale,
} from "../../src/admin/adminLocale.jsx"

const NAV = [
  { key: "", label: "Overview", icon: Icons.grid, to: "/admin" },
  { key: "ai", label: "AI Assistant", icon: Icons.sparkle, to: "/admin/ai" },
  { key: "services", label: "Services", icon: Icons.services, to: "/admin/services" },
  { key: "work", label: "Work", icon: Icons.work, to: "/admin/work" },
  { key: "experience", label: "Experience", icon: Icons.briefcase, to: "/admin/experience" },
  { key: "certifications", label: "Certifications", icon: Icons.award, to: "/admin/certifications" },
  { key: "posts", label: "Blog", icon: Icons.post, to: "/admin/posts" },
  { key: "interface", label: "Interface", icon: Icons.globe, to: "/admin/interface" },
  { key: "profile", label: "Profile", icon: Icons.user, to: "/admin/profile" },
]

function sectionFromPath(pathname) {
  const parts = (pathname || "").replace(/^\/admin\/?/, "").split("/").filter(Boolean)
  return parts[0] || ""
}

function Sidebar({ active, initials, onSignOut }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="mark">{initials || "DF"}</div>
        <div>
          <div className="brand-name">Studio</div>
          <div className="brand-sub">Content dashboard</div>
        </div>
      </div>
      <nav className="admin-nav">
        <div className="group-label">Manage</div>
        {NAV.map((n) => (
          <Link key={n.key} to={n.to} className={active === n.key ? "active" : ""}>
            <n.icon />
            {n.label}
          </Link>
        ))}
      </nav>
      <AdminLocaleSwitcher />
      <div className="admin-sidebar-footer">
        <Link to="/" className="admin-side-link">
          <Icons.external /> View site
        </Link>
        {!DEMO && (
          <button onClick={onSignOut} className="admin-side-link">
            <Icons.logout /> Sign out
          </button>
        )}
      </div>
    </aside>
  )
}

function AdminShell({ children }) {
  const { locale } = useAdminLocale()
  const pathname = usePathname()
  const active = sectionFromPath(pathname)
  const [profile, setProfile] = useState({ initials: "DF", name: "" })
  const [state, setState] = useState({ checking: !DEMO, session: null })

  // Auth gate (demo mode skips auth entirely).
  useEffect(() => {
    if (DEMO) return
    auth
      .getSession()
      .then((session) => setState({ checking: false, session }))
      .catch(() => setState({ checking: false, session: null }))
    const unsub = auth.onChange((session) => setState({ checking: false, session }))
    return unsub
  }, [])

  // Load profile once we're allowed in (for the current editing language).
  const authed = DEMO || !!state.session
  useEffect(() => {
    if (!authed) return
    getProfile(locale)
      .then((p) =>
        setProfile(
          p ? { initials: p.initials || "DF", name: p.name || "" } : { initials: "DF", name: "" }
        )
      )
      .catch(() => {})
  }, [authed, locale])

  const signOut = async () => {
    await auth.signOut()
    window.location.reload()
  }

  if (!DEMO && state.checking) {
    return (
      <div className="admin">
        <div className="admin-main">
          <Spinner />
        </div>
      </div>
    )
  }

  if (!DEMO && !state.session) {
    return <Login onSignedIn={(session) => setState({ checking: false, session })} />
  }

  return (
    <ToastProvider>
      <ChromeCtx.Provider value={{ initials: profile.initials, name: profile.name }}>
        <div className="admin">
          <Sidebar active={active} initials={profile.initials} onSignOut={signOut} />
          {children}
        </div>
      </ChromeCtx.Provider>
    </ToastProvider>
  )
}

export default function AdminLayout({ children }) {
  return (
    <AdminLocaleProvider>
      <AdminShell>{children}</AdminShell>
    </AdminLocaleProvider>
  )
}
