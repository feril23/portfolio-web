import { createContext, useContext, useEffect, useRef, useState } from "react"

/* =====================================================================
   Icons (inline, 24x24 stroke set)
   ===================================================================== */
const I = (path, extra) => (props) =>
  (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {path}
      {extra}
    </svg>
  )

export const Icons = {
  grid: I(<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>),
  work: I(<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>),
  briefcase: I(<><path d="M4 8h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" /><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></>),
  services: I(<><path d="M4 6h16M4 12h16M4 18h16" /><path d="M8 3v6M16 9v6M10 15v6" /></>),
  award: I(<><circle cx="12" cy="9" r="6" /><path d="M8.5 14 7 21l5-3 5 3-1.5-7" /></>),
  post: I(<><path d="M4 4h16v16H4z" /><path d="M8 8h8M8 12h8M8 16h5" /></>),
  user: I(<><circle cx="12" cy="8" r="4" /><path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" /></>),
  plus: I(<path d="M12 5v14M5 12h14" />),
  edit: I(<><path d="M4 20h4l10-10-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></>),
  trash: I(<><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13" /></>),
  close: I(<path d="M6 6l12 12M18 6L6 18" />),
  check: I(<path d="M5 13l4 4L19 7" />),
  image: I(<><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="M21 16l-5-5L5 21" /></>),
  external: I(<><path d="M14 5h5v5" /><path d="M19 5l-8 8" /><path d="M19 13v6H5V5h6" /></>),
  logout: I(<><path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3" /><path d="M10 8l-4 4 4 4M6 12h11" /></>),
  info: I(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>),
  sparkle: I(<path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />),
  eye: I(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>),
  lock: I(<><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>),
  search: I(<><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6" /></>),
  bell: I(<><path d="M6 9a6 6 0 0 1 12 0c0 4.6 1.8 5.6 1.8 5.6H4.2S6 13.6 6 9z" /><path d="M10.2 19a2 2 0 0 0 3.6 0" /></>),
  chevron: I(<path d="M9 6l6 6-6 6" />),
  globe: I(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.9 2.6 15.1 0 18M12 3c-2.6 2.9-2.6 15.1 0 18" /></>),
}

/* =====================================================================
   Buttons
   ===================================================================== */
export function Button({
  variant = "secondary",
  size,
  icon: Icon,
  children,
  className = "",
  loading,
  ...rest
}) {
  return (
    <button
      className={`a-btn a-btn--${variant}${size ? ` a-btn--${size}` : ""}${
        !children ? " a-btn--icon" : ""
      } ${className}`}
      {...rest}
    >
      {loading ? <span className="a-spin" /> : Icon ? <Icon /> : null}
      {children}
    </button>
  )
}

/* =====================================================================
   Form fields
   ===================================================================== */
export function Field({ label, hint, optional, children, className = "" }) {
  return (
    <div className={`a-field ${className}`}>
      {label && (
        <label className="a-label">
          {label} {optional && <span className="opt">(optional)</span>}
        </label>
      )}
      {children}
      {hint && <span className="a-hint">{hint}</span>}
    </div>
  )
}

export function Input(props) {
  return <input className="a-input" {...props} />
}
export function Textarea({ code, ...props }) {
  return <textarea className={`a-textarea${code ? " a-textarea--code" : ""}`} {...props} />
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="a-switch">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="track" />
      {label && <span>{label}</span>}
    </label>
  )
}

export function TagInput({ value = [], onChange, placeholder = "Add and press Enter" }) {
  const [draft, setDraft] = useState("")
  const add = () => {
    const v = draft.trim()
    if (v && !value.includes(v)) onChange([...value, v])
    setDraft("")
  }
  return (
    <div className="a-taginput">
      {value.map((t) => (
        <span className="a-chip" key={t}>
          {t}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== t))}>
            <Icons.close style={{ width: 12, height: 12 }} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            add()
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={add}
      />
    </div>
  )
}

export function ImageUpload({ value, onUpload, uploading }) {
  const ref = useRef(null)
  return (
    <div className="a-upload">
      <div className="preview">
        {value ? <img src={value} alt="" /> : <Icons.image />}
      </div>
      <div>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onUpload(f)
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={uploading}
          onClick={() => ref.current?.click()}
        >
          {value ? "Replace image" : "Upload image"}
        </Button>
        <div className="a-hint" style={{ marginTop: 8 }}>
          PNG or JPG, up to ~5MB.
        </div>
      </div>
    </div>
  )
}

/* =====================================================================
   Badges / tags
   ===================================================================== */
export function Badge({ tone = "muted", dot, children }) {
  return (
    <span className={`a-badge a-badge--${tone}`}>
      {dot && <span className="d" />}
      {children}
    </span>
  )
}
export const Tag = ({ children }) => <span className="a-tag">{children}</span>

/* =====================================================================
   Empty state / cards / stats
   ===================================================================== */
export function EmptyState({ icon: Icon = Icons.sparkle, title, children, action }) {
  return (
    <div className="a-empty">
      <div className="ico">
        <Icon />
      </div>
      <h4>{title}</h4>
      {children && <p>{children}</p>}
      {action}
    </div>
  )
}

export function StatCard({ icon: Icon, label, value, meta }) {
  return (
    <div className="a-stat">
      <div className="stat-top">
        <span className="label">{label}</span>
        {Icon && (
          <span className="ico">
            <Icon />
          </span>
        )}
      </div>
      <div className="value">{value}</div>
      {meta && <div className="meta">{meta}</div>}
    </div>
  )
}

/* =====================================================================
   Drawer (slide-over)
   ===================================================================== */
export function Drawer({ title, subtitle, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [onClose])
  return (
    <>
      <div className="a-overlay" onClick={onClose} />
      <aside className="a-drawer" role="dialog" aria-modal="true">
        <div className="a-drawer-head">
          <div>
            <h3>{title}</h3>
            {subtitle && <div className="sub">{subtitle}</div>}
          </div>
          <Button variant="ghost" icon={Icons.close} onClick={onClose} aria-label="Close" />
        </div>
        <div className="a-drawer-body">{children}</div>
        {footer && <div className="a-drawer-foot">{footer}</div>}
      </aside>
    </>
  )
}

/* =====================================================================
   Toasts
   ===================================================================== */
const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const push = (message, tone = "default") => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600)
  }
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="a-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`a-toast${t.tone !== "default" ? ` a-toast--${t.tone}` : ""}`}>
            {t.tone === "success" && <Icons.check />}
            {t.tone === "error" && <Icons.info />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function Spinner() {
  return (
    <div className="a-loading">
      <span className="a-spin" />
    </div>
  )
}

/* =====================================================================
   Data-loading hook
   ===================================================================== */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ loading: true, data: null, error: null })
  const run = () => {
    setState((s) => ({ ...s, loading: true }))
    Promise.resolve()
      .then(fn)
      .then((data) => setState({ loading: false, data, error: null }))
      .catch((error) => setState({ loading: false, data: null, error }))
  }
  useEffect(run, deps) // eslint-disable-line react-hooks/exhaustive-deps
  return { ...state, reload: run }
}

/* =====================================================================
   Page header (sticky topbar)
   ===================================================================== */
export const ChromeCtx = createContext({ initials: "", name: "" })

export function Avatar({ name, initials, src, size = 34 }) {
  const label =
    initials ||
    (name ? name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("") : "")
  return (
    <span
      className="a-avatar"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {src ? <img src={src} alt={name || ""} /> : <span>{(label || "?").toUpperCase()}</span>}
    </span>
  )
}

export function PageHeader({ title, sub, actions }) {
  const chrome = useContext(ChromeCtx)
  return (
    <div className="admin-topbar">
      <div className="admin-topbar-inner">
        <div className="admin-topbar-lead">
          <div className="page-title">{title}</div>
          {sub && <div className="page-sub">{sub}</div>}
        </div>
        <label className="admin-search">
          <Icons.search />
          <input placeholder="Search or type a command" aria-label="Search" />
          <kbd>⌘F</kbd>
        </label>
        <div className="admin-topbar-actions">
          {actions}
          <button className="admin-iconbtn" type="button" aria-label="Notifications">
            <Icons.bell />
            <span className="dot" />
          </button>
          <Avatar name={chrome.name} initials={chrome.initials} />
        </div>
      </div>
    </div>
  )
}

/* =====================================================================
   Demo-mode banner
   ===================================================================== */
export function DemoBanner() {
  return (
    <div className="a-banner">
      <Icons.info />
      <div>
        <div className="title">Preview / demo mode</div>
        <div className="body">
          You’re viewing sample content. Add your Supabase keys to{" "}
          <code>.env</code> to load your real data and enable saving.
        </div>
      </div>
    </div>
  )
}

/* =====================================================================
   Bar chart (dependency-free)
   ===================================================================== */
export function BarChart({ data = [], height = 150 }) {
  const max = Math.max(1, ...data.map((d) => Number(d.value) || 0))
  return (
    <div className="a-chart" style={{ height }}>
      {data.map((d, i) => {
        const pct = Math.round(((Number(d.value) || 0) / max) * 100)
        return (
          <div className="a-chart-col" key={i} title={`${d.label}: ${d.value}`}>
            <div className="a-chart-track">
              <div className="a-chart-bar" style={{ height: `${Math.max(pct, 4)}%` }}>
                <span className="a-chart-v">{d.value}</span>
              </div>
            </div>
            <div className="a-chart-x">{d.label}</div>
          </div>
        )
      })}
    </div>
  )
}
