import { useState, useEffect } from "react"
import { getProfile, getSocials, getSkills, saveProfile, socialsApi, skillsApi } from "../../lib/api.js"
import {
  PageHeader,
  Button,
  Icons,
  Spinner,
  Field,
  Input,
  Textarea,
  TagInput,
  DemoBanner,
  useAsync,
  useToast,
} from "../ui.jsx"
import { useAdminLocale } from "../adminLocale.jsx"

export default function Profile({ demo }) {
  const toast = useToast()
  const { locale } = useAdminLocale()
  const { data, loading } = useAsync(async () => {
    const [profile, socials, skills] = await Promise.all([
      getProfile(locale),
      getSocials(locale),
      getSkills(locale),
    ])
    return { profile, socials, skills }
  }, [locale])
  const [form, setForm] = useState(null)
  const [socials, setSocials] = useState([])
  const [skills, setSkills] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data) {
      setForm({
        ...data.profile,
        roles: data.profile?.roles || [],
        paragraphs: data.profile?.paragraphs || [],
        keywords: data.profile?.keywords || [],
      })
      setSocials(data.socials || [])
      setSkills(data.skills || [])
    }
  }, [data])

  if (loading || !form) {
    return (
      <div className="admin-main">
        <PageHeader title="Profile" sub="Your identity and site content" />
        <div className="admin-content">
          <Spinner />
        </div>
      </div>
    )
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      await saveProfile(
        {
          name: form.name,
          initials: form.initials,
          role: form.role,
          roles: form.roles,
          headline: form.headline,
          statement: form.statement,
          paragraphs: form.paragraphs,
          keywords: form.keywords,
          location: form.location,
          availability: form.availability,
          email: form.email,
        },
        locale
      )
      for (const s of socials) await socialsApi.save(s, locale)
      for (const s of skills) await skillsApi.save(s, locale)
      toast("Profile saved", "success")
    } catch (e) {
      toast(e.message, "error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-main">
      <PageHeader
        title="Profile"
        sub="Your identity and site content"
        actions={
          <Button variant="primary" icon={Icons.check} onClick={save} loading={saving}>
            Save changes
          </Button>
        }
      />
      <div className="admin-content admin-section-gap">
        {demo && <DemoBanner />}

        <div className="a-card">
          <div className="a-card-head">
            <div>
              <h3>Identity</h3>
              <div className="sub">Name, role, and contact</div>
            </div>
          </div>
          <div className="a-card-body a-form-stack">
            <div className="a-form-grid">
              <Field label="Name">
                <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} />
              </Field>
              <Field label="Initials" hint="Used in the dashboard mark">
                <Input value={form.initials || ""} onChange={(e) => set("initials", e.target.value)} />
              </Field>
              <Field label="Role">
                <Input value={form.role || ""} onChange={(e) => set("role", e.target.value)} />
              </Field>
              <Field label="Email">
                <Input value={form.email || ""} onChange={(e) => set("email", e.target.value)} />
              </Field>
              <Field label="Location">
                <Input value={form.location || ""} onChange={(e) => set("location", e.target.value)} />
              </Field>
              <Field label="Availability">
                <Input value={form.availability || ""} onChange={(e) => set("availability", e.target.value)} />
              </Field>
            </div>
          </div>
        </div>

        <div className="a-card">
          <div className="a-card-head">
            <div>
              <h3>Hero &amp; about</h3>
              <div className="sub">The headline and intro copy on your homepage</div>
            </div>
          </div>
          <div className="a-card-body a-form-stack">
            <Field label="Headline" hint="Wrap words in *asterisks* to highlight them in the accent color">
              <Textarea
                value={form.headline || ""}
                onChange={(e) => set("headline", e.target.value)}
                style={{ minHeight: 70 }}
              />
            </Field>
            <Field label="About statement">
              <Textarea value={form.statement || ""} onChange={(e) => set("statement", e.target.value)} style={{ minHeight: 80 }} />
            </Field>
            <Field label="About paragraphs" hint="Each tag becomes one paragraph">
              <TagInput value={form.paragraphs || []} onChange={(v) => set("paragraphs", v)} placeholder="Add a paragraph and press Enter" />
            </Field>
            <Field label="Marquee keywords">
              <TagInput value={form.keywords || []} onChange={(v) => set("keywords", v)} />
            </Field>
          </div>
        </div>

        <div className="a-card">
          <div className="a-card-head">
            <div>
              <h3>Social links</h3>
              <div className="sub">Shown in the contact section</div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={Icons.plus}
              onClick={() => setSocials((s) => [...s, { label: "", href: "", sort: s.length }])}
            >
              Add link
            </Button>
          </div>
          <div className="a-card-body a-form-stack">
            {socials.length === 0 && <div className="a-muted">No links yet.</div>}
            {socials.map((s, i) => (
              <div className="a-row-flex" key={i}>
                <Input
                  style={{ maxWidth: 180 }}
                  value={s.label}
                  placeholder="GitHub"
                  onChange={(e) => setSocials((arr) => arr.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                />
                <Input
                  value={s.href}
                  placeholder="https://…"
                  onChange={(e) => setSocials((arr) => arr.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))}
                />
                <Button variant="ghost" size="sm" icon={Icons.trash} aria-label="Remove" onClick={() => setSocials((arr) => arr.filter((_, j) => j !== i))} />
              </div>
            ))}
          </div>
        </div>

        <div className="a-card">
          <div className="a-card-head">
            <div>
              <h3>Skills</h3>
              <div className="sub">Grouped skill lists in the About section</div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={Icons.plus}
              onClick={() => setSkills((s) => [...s, { group: "", items: [], sort: s.length }])}
            >
              Add group
            </Button>
          </div>
          <div className="a-card-body a-form-stack">
            {skills.length === 0 && <div className="a-muted">No skill groups yet.</div>}
            {skills.map((s, i) => (
              <div className="a-form-stack" key={i}>
                <div className="a-row-flex">
                  <Input
                    style={{ maxWidth: 220 }}
                    value={s.group}
                    placeholder="Design"
                    onChange={(e) => setSkills((arr) => arr.map((x, j) => (j === i ? { ...x, group: e.target.value } : x)))}
                  />
                  <Button variant="ghost" size="sm" icon={Icons.trash} aria-label="Remove group" onClick={() => setSkills((arr) => arr.filter((_, j) => j !== i))} />
                </div>
                <TagInput
                  value={s.items || []}
                  onChange={(v) => setSkills((arr) => arr.map((x, j) => (j === i ? { ...x, items: v } : x)))}
                />
                {i < skills.length - 1 && <hr className="a-divider" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
