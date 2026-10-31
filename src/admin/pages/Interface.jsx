import { useState, useEffect } from "react"
import { getUIStrings, saveUIStrings } from "../../lib/api.js"
import { mergeUI } from "../../i18n/ui.js"
import { useAdminLocale } from "../adminLocale.jsx"
import {
  PageHeader,
  Button,
  Icons,
  Spinner,
  Field,
  Input,
  Textarea,
  DemoBanner,
  useAsync,
  useToast,
} from "../ui.jsx"

// Friendly titles for each group of interface strings.
const GROUP_TITLES = {
  lang: "Language label",
  nav: "Navigation",
  hero: "Hero",
  sections: "Sections",
  services: "Services section",
  blog: "Blog",
  footer: "Footer",
  curtain: "Page transition labels",
  theme: "Theme toggle",
  a11y: "Accessibility labels",
  meta: "SEO metadata",
}
const GROUP_SUBS = {
  meta: "Titles and descriptions used by search engines and social previews",
  curtain: "The word shown in the sliding curtain during navigation",
  services: "Naming and supporting copy for the public capability ledger",
  a11y: "Screen-reader labels \u2014 usually fine to leave as is",
}
const LONG_FIELDS = new Set(["homeDesc", "blogDesc", "intro"])

function pretty(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim()
}

export default function Interface({ demo }) {
  const toast = useToast()
  const { locale } = useAdminLocale()
  const { data, loading } = useAsync(async () => {
    const overrides = await getUIStrings(locale)
    return mergeUI(locale, overrides)
  }, [locale])
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data) setForm(JSON.parse(JSON.stringify(data)))
  }, [data])

  if (loading || !form) {
    return (
      <div className="admin-main">
        <PageHeader title="Interface text" sub="Buttons, labels, and SEO copy" />
        <div className="admin-content">
          <Spinner />
        </div>
      </div>
    )
  }

  const setLeaf = (group, key, value) =>
    setForm((f) => ({ ...f, [group]: { ...f[group], [key]: value } }))

  const save = async () => {
    setSaving(true)
    try {
      await saveUIStrings(locale, form)
      toast("Interface text saved", "success")
    } catch (e) {
      toast(e.message, "error")
    } finally {
      setSaving(false)
    }
  }

  const groups = Object.keys(form).filter(
    (g) => form[g] && typeof form[g] === "object"
  )

  return (
    <div className="admin-main">
      <PageHeader
        title="Interface text"
        sub="Buttons, labels, and SEO copy for the public site"
        actions={
          <Button variant="primary" icon={Icons.check} onClick={save} loading={saving}>
            Save changes
          </Button>
        }
      />
      <div className="admin-content admin-section-gap">
        {demo && <DemoBanner />}
        {groups.map((group) => (
          <div className="a-card" key={group}>
            <div className="a-card-head">
              <div>
                <h3>{GROUP_TITLES[group] || pretty(group)}</h3>
                {GROUP_SUBS[group] && <div className="sub">{GROUP_SUBS[group]}</div>}
              </div>
            </div>
            <div className="a-card-body a-form-stack">
              <div className="a-form-grid">
                {Object.keys(form[group]).map((key) => {
                  const val = form[group][key]
                  if (typeof val !== "string") return null
                  const long = LONG_FIELDS.has(key) || val.length > 70
                  return (
                    <Field key={key} label={pretty(key)} className={long ? "a-col-span" : ""}>
                      {long ? (
                        <Textarea
                          value={val}
                          onChange={(e) => setLeaf(group, key, e.target.value)}
                          style={{ minHeight: 70 }}
                        />
                      ) : (
                        <Input value={val} onChange={(e) => setLeaf(group, key, e.target.value)} />
                      )}
                    </Field>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
