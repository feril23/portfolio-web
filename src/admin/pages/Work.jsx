import { useState } from "react"
import { getProjects, projectsApi, uploadImage } from "../../lib/api.js"
import { useAdminLocale } from "../adminLocale.jsx"
import {
  PageHeader,
  Button,
  Icons,
  Spinner,
  Field,
  Input,
  Textarea,
  TagInput,
  ImageUpload,
  Drawer,
  EmptyState,
  Tag,
  DemoBanner,
  useAsync,
  useToast,
} from "../ui.jsx"

const blank = { title: "", description: "", tags: [], year: "", href: "", image_url: null }

export default function Work({ demo }) {
  const toast = useToast()
  const { locale } = useAdminLocale()
  const { data: projects, loading, reload } = useAsync(() => getProjects(locale), [locale])
  const [editing, setEditing] = useState(null) // row or blank
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const open = (row) => {
    setForm(row ? { ...row } : blank)
    setEditing(row || blank)
  }
  const close = () => setEditing(null)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      await projectsApi.save(form, locale)
      toast("Project saved", "success")
      close()
      reload()
    } catch (e) {
      toast(e.message, "error")
    } finally {
      setSaving(false)
    }
  }
  const remove = async (row) => {
    if (!window.confirm(`Delete \u201c${row.title}\u201d?`)) return
    try {
      await projectsApi.remove(row.id)
      toast("Project deleted", "success")
      reload()
    } catch (e) {
      toast(e.message, "error")
    }
  }
  const onUpload = async (file) => {
    setUploading(true)
    try {
      const url = await uploadImage(file)
      set("image_url", url)
    } catch (e) {
      toast(e.message, "error")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="admin-main">
      <PageHeader
        title="Work"
        sub="Projects featured in your portfolio"
        actions={
          <Button variant="primary" icon={Icons.plus} onClick={() => open(null)}>
            New project
          </Button>
        }
      />
      <div className="admin-content admin-section-gap">
        {demo && <DemoBanner />}
        <div className="a-card">
          {loading ? (
            <Spinner />
          ) : projects.length === 0 ? (
            <EmptyState
              icon={Icons.work}
              title="No projects yet"
              action={
                <Button variant="primary" icon={Icons.plus} onClick={() => open(null)}>
                  Add your first project
                </Button>
              }
            >
              Showcase your best work. Add a title, description, tags, and a cover image.
            </EmptyState>
          ) : (
            <div className="a-card-body" style={{ padding: "8px 4px" }}>
              <table className="a-table">
                <thead>
                  <tr>
                    <th style={{ width: 62 }} />
                    <th>Project</th>
                    <th style={{ width: 200 }}>Tags</th>
                    <th style={{ width: 70 }}>Year</th>
                    <th style={{ width: 96 }} />
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="a-thumb">
                          {p.image_url ? <img src={p.image_url} alt="" /> : <Icons.image />}
                        </div>
                      </td>
                      <td>
                        <div className="a-row-title">{p.title}</div>
                        <div className="a-row-sub">{p.description}</div>
                      </td>
                      <td>
                        <div className="a-tags">
                          {(p.tags || []).map((t) => (
                            <Tag key={t}>{t}</Tag>
                          ))}
                        </div>
                      </td>
                      <td className="a-muted">{p.year}</td>
                      <td>
                        <div className="a-row-actions">
                          <Button variant="ghost" size="sm" icon={Icons.edit} onClick={() => open(p)} aria-label="Edit" />
                          <Button variant="ghost" size="sm" icon={Icons.trash} onClick={() => remove(p)} aria-label="Delete" />
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
          title={form.id ? "Edit project" : "New project"}
          subtitle="Shown in the Selected Work section"
          onClose={close}
          footer={
            <>
              <Button variant="ghost" className="spacer" onClick={close}>
                Cancel
              </Button>
              <Button variant="primary" icon={Icons.check} onClick={save} loading={saving}>
                Save project
              </Button>
            </>
          }
        >
          <div className="a-form-stack">
            <Field label="Cover image" optional>
              <ImageUpload value={form.image_url} onUpload={onUpload} uploading={uploading} />
            </Field>
            <Field label="Title">
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Aurora Design System" />
            </Field>
            <Field label="Description">
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="A short summary of the project\u2026"
              />
            </Field>
            <div className="a-form-grid">
              <Field label="Year">
                <Input value={form.year} onChange={(e) => set("year", e.target.value)} placeholder="2025" />
              </Field>
              <Field label="Link" optional hint="Where the project card points to">
                <Input value={form.href} onChange={(e) => set("href", e.target.value)} placeholder="https://\u2026" />
              </Field>
            </div>
            <Field label="Tags">
              <TagInput value={form.tags || []} onChange={(v) => set("tags", v)} />
            </Field>
          </div>
        </Drawer>
      )}
    </div>
  )
}
