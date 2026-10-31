import { useState } from "react"
import { getExperience, experienceApi } from "../../lib/api.js"
import { useAdminLocale } from "../adminLocale.jsx"
import {
  PageHeader,
  Button,
  Icons,
  Spinner,
  Field,
  Input,
  Textarea,
  Drawer,
  EmptyState,
  DemoBanner,
  useAsync,
  useToast,
} from "../ui.jsx"

const blank = { role: "", company: "", period: "", description: "", sort: 0 }

export default function Experience({ demo }) {
  const toast = useToast()
  const { locale } = useAdminLocale()
  const { data: items, loading, reload } = useAsync(() => getExperience(locale), [locale])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)

  const open = (row) => {
    setForm(row ? { ...row } : blank)
    setEditing(row || blank)
  }
  const close = () => setEditing(null)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      await experienceApi.save(form, locale)
      toast("Experience saved", "success")
      close()
      reload()
    } catch (e) {
      toast(e.message, "error")
    } finally {
      setSaving(false)
    }
  }
  const remove = async (row) => {
    if (!window.confirm(`Delete \u201c${row.role}\u201d?`)) return
    try {
      await experienceApi.remove(row.id)
      toast("Deleted", "success")
      reload()
    } catch (e) {
      toast(e.message, "error")
    }
  }

  return (
    <div className="admin-main">
      <PageHeader
        title="Experience"
        sub="Your work history timeline"
        actions={
          <Button variant="primary" icon={Icons.plus} onClick={() => open(null)}>
            New role
          </Button>
        }
      />
      <div className="admin-content admin-section-gap">
        {demo && <DemoBanner />}
        <div className="a-card">
          {loading ? (
            <Spinner />
          ) : items.length === 0 ? (
            <EmptyState
              icon={Icons.briefcase}
              title="No roles yet"
              action={
                <Button variant="primary" icon={Icons.plus} onClick={() => open(null)}>
                  Add a role
                </Button>
              }
            >
              Add the positions you want to highlight in your timeline.
            </EmptyState>
          ) : (
            <div className="a-card-body" style={{ padding: "8px 4px" }}>
              <table className="a-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th style={{ width: 200 }}>Period</th>
                    <th style={{ width: 96 }} />
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td>
                        <div className="a-row-title">
                          {it.role} <span className="a-muted">\u2014 {it.company}</span>
                        </div>
                        <div className="a-row-sub">{it.description}</div>
                      </td>
                      <td className="a-muted">{it.period}</td>
                      <td>
                        <div className="a-row-actions">
                          <Button variant="ghost" size="sm" icon={Icons.edit} onClick={() => open(it)} aria-label="Edit" />
                          <Button variant="ghost" size="sm" icon={Icons.trash} onClick={() => remove(it)} aria-label="Delete" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {editing && (
        <Drawer
          title={form.id ? "Edit role" : "New role"}
          subtitle="Shown in the Experience timeline"
          onClose={close}
          footer={
            <>
              <Button variant="ghost" className="spacer" onClick={close}>
                Cancel
              </Button>
              <Button variant="primary" icon={Icons.check} onClick={save} loading={saving}>
                Save role
              </Button>
            </>
          }
        >
          <div className="a-form-stack">
            <div className="a-form-grid">
              <Field label="Role">
                <Input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="Product Designer" />
              </Field>
              <Field label="Company">
                <Input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Studio Example" />
              </Field>
            </div>
            <Field label="Period">
              <Input value={form.period} onChange={(e) => set("period", e.target.value)} placeholder="2023 \u2014 Present" />
            </Field>
            <Field label="Description">
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="What you did in this role\u2026"
              />
            </Field>
          </div>
        </Drawer>
      )}
    </div>
  )
}
