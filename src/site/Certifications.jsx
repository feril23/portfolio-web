"use client"
import { useEffect, useRef, useState } from "react"
import { useUI, useLocale } from "../i18n/context.jsx"

function formatMonth(value, locale) {
  if (!value) return ""
  try {
    return new Date(value).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
      month: "short", year: "numeric", timeZone: "UTC",
    })
  } catch { return "" }
}

function VerifyLink({ item, label }) {
  if (!item.credential_url) return null
  return <a className="cert-action" href={item.credential_url} target="_blank" rel="noreferrer" data-hover>{label}<span>↗</span></a>
}

export default function Certifications({ items = [] }) {
  const t = useUI().certifications
  const locale = useLocale()
  const [active, setActive] = useState(null)
  const dialog = useRef(null)

  useEffect(() => {
    const node = dialog.current
    if (!active || !node) return
    node.showModal()
    window.__lenis?.stop()
    return () => {
      window.__lenis?.start()
      if (node.open) node.close()
    }
  }, [active])

  if (!items.length) return null
  const featured = items.filter((item) => item.featured && item.image_url)
  const others = items.filter((item) => !featured.includes(item))
  const validity = active?.expires_at ? `${t.validUntil} ${formatMonth(active.expires_at, locale)}` : ""

  return (
    <section id="certifications" className="section certifications">
      <div className="container">
        <div className="section-meta"><span>{t.label}</span><span>{t.meta}</span></div>
        <h2 className="section-title" data-split>{t.title}</h2>

        {featured.length > 0 && (
          <div className="cert-featured">
            {featured.map((item) => (
              <button type="button" className="cert-feature" key={item.id || item.title} onClick={() => setActive(item)} aria-label={`${t.view}: ${item.title}`} data-reveal data-hover>
                <span className="cert-feature-media"><img src={item.image_url} alt="" loading="lazy" /></span>
                <span className="cert-feature-meta"><span>{item.issuer}</span><span>{formatMonth(item.issued_at, locale)}</span></span>
                <strong>{item.title}</strong>
                {item.description && <span className="cert-feature-desc">{item.description}</span>}
              </button>
            ))}
          </div>
        )}

        {others.length > 0 && (
          <ol className="cert-list">
            {others.map((item) => (
              <li className="cert-row" key={item.id || item.title} data-reveal>
                <span className="cert-date">{formatMonth(item.issued_at, locale)}</span>
                <div className="cert-row-body"><h3>{item.title}</h3><span>{item.issuer}</span></div>
                <div className="cert-actions">
                  {item.image_url && <button type="button" className="cert-action" onClick={() => setActive(item)} data-hover>{t.view}<span>↗</span></button>}
                  <VerifyLink item={item} label={t.verify} />
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {active && (
        <dialog
          ref={dialog}
          className="cert-dialog"
          aria-label={active.title}
          onClose={() => setActive(null)}
          onClick={(event) => { if (event.target === dialog.current) setActive(null) }}
        >
          <figure>
            <img src={active.image_url} alt={active.title} />
            <figcaption>
              <div>
                <strong>{active.title}</strong>
                <span>{[active.issuer, formatMonth(active.issued_at, locale), validity].filter(Boolean).join(" · ")}</span>
              </div>
              <div className="cert-actions">
                <VerifyLink item={active} label={t.verify} />
                <button type="button" className="cert-action" onClick={() => setActive(null)} autoFocus>{t.close}</button>
              </div>
            </figcaption>
          </figure>
        </dialog>
      )}
    </section>
  )
}
