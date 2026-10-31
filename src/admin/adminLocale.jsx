"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { defaultLocale, locales } from "../i18n/config.js"
import { getUI } from "../i18n/ui.js"

// Which language the dashboard is currently editing. This is independent from
// the public site's locale — it just tells the editors which set of rows to
// load and save. Persisted to localStorage so it survives reloads.
const AdminLocaleContext = createContext({
  locale: defaultLocale,
  setLocale: () => {},
  locales,
})

export function AdminLocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(defaultLocale)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_locale")
      if (saved && locales.includes(saved)) setLocaleState(saved)
    } catch {}
  }, [])
  const setLocale = (l) => {
    if (!locales.includes(l)) return
    setLocaleState(l)
    try {
      localStorage.setItem("admin_locale", l)
    } catch {}
  }
  return (
    <AdminLocaleContext.Provider value={{ locale, setLocale, locales }}>
      {children}
    </AdminLocaleContext.Provider>
  )
}

export function useAdminLocale() {
  return useContext(AdminLocaleContext)
}

// Segmented control shown in the sidebar. Switching reloads every editor for
// the chosen language.
export function AdminLocaleSwitcher() {
  const { locale, setLocale, locales: list } = useAdminLocale()
  return (
    <div className="admin-locale">
      <span className="admin-locale-label">Editing language</span>
      <div className="admin-locale-seg">
        {list.map((l) => (
          <button
            key={l}
            type="button"
            className={l === locale ? "active" : ""}
            onClick={() => setLocale(l)}
            title={getUI(l).lang.name}
          >
            {getUI(l).lang.short}
          </button>
        ))}
      </div>
    </div>
  )
}
