import { useState } from "react"
import { getCertifications, certificationsApi, uploadImage } from "../../lib/api.js"
import { useAdminLocale } from "../adminLocale.jsx"
import {
  PageHeader,
  Button,
  Icons,
  Spinner,
  Field,
  Input,
  Textarea,
  ImageUpload,
  Toggle,
  Drawer,
  EmptyState,
  Badge,
  DemoBanner,
  useAsync,
  useToast,
} from "../ui.jsx"

const blank = {
  title: "",
  issuer: "",
  description: "",
  issued_at: "",
  expires_at: "",
  credential_id: "",
  credential_url: "",
  image_url: null,
  featured: false,
  sort: 0,
  published: true,
}

export default function Certifications({ demo }) {
  const toast = useToast()
  const { locale } = useAdminLocale()
  const { data: items, loading, reload } = useAsync(() => getCertifications({ locale }), [locale])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const open = (row) => {
    setForm(row ? { ...blank, ...row, issued_at: row.issued_at || "", expires_at: row.expires_at || "" } : blank)
    setEditing(row || blank)
  }
  const close = () => setEditing(null)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      await certificationsApi.save({ ...form, issued_at: form.issued_at || null, expires_at: form.expires_at || null }, locale)
      toast("Certification saved", "success")
      close()
      reload()
    } catch (e) {
      toast(e.message, "error")
    } finally {
      setSaving(false)
    }
  }
  const remove = async (row) => {
    if (!window.confirm(`Delete “${row.title}”?`)) return
    try {
      await certificationsApi.remove(row.id)
      toast("Deleted", "success")
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
        title="Certifications"
        sub="Certificates and awards on your portfolio"
        actions={
          <Button variant="primary" icon={Icons.plus} onClick={() => open(null)}>
            New certification
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
              icon={Icons.award}
              title="No certifications yet"
              action={
                <Button variant="primary" icon={Icons.plus} onClick={() => open(null)}>
                  Add a certification
                </Button>
              }
            >
              Add certificates and awards. Hide personal data in the image before uploading, because uploaded images are public.
            </EmptyState>
          ) : (
            <div className="a-card-body" style={{ padding: "8px 4px" }}>
              <table className="a-table">
                <thead>
                  <tr>
                    <th style={{ width: 62 }} />
                    <th>Certification</th>
                    <th style={{ width: 110 }}>Issued</th>
                    <th style={{ width: 110 }}>Status</th>
                    <th style={{ width: 96 }} />
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td>
                        <div className="a-thumb">
                          {it.image_url ? <img src={it.image_url} alt="" /> : <Icons.image />}
                        </div>
                      </td>
                      <td>
                        <div className="a-row-title">{it.title}</div>
                        <div className="a-row-sub">{it.issuer}</div>
                      </td>
                      <td className="a-muted">{it.issued_at}</td>
                      <td>
                        <Badge tone={it.published ? "success" : "muted"} dot>{it.published ? (it.featured ? "Featured" : "Published") : "Hidden"}</Badge>
                      </td>
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
          title={form.id ? "Edit certification" : "New certification"}
          subtitle="Shown in the Certifications section"
          onClose={close}
          footer={
            <>
              <Button variant="ghost" className="spacer" onClick={close}>
                Cancel
              </Button>
              <Button variant="primary" icon={Icons.check} onClick={save} loading={saving}>
                Save certification
              </Button>
            </>
          }
        >
          <div className="a-form-stack">
            <Field label="Certificate image" optional hint="Public. Hide personal data before uploading.">
              <ImageUpload value={form.image_url} onUpload={onUpload} uploading={uploading} />
            </Field>
            <Field label="Title">
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Junior Web Developer" />
            </Field>
            <Field label="Issuer">
              <Input value={form.issuer} onChange={(e) => set("issuer", e.target.value)} placeholder="BNSP" />
            </Field>
            <Field label="Description" optional>
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="One short line about this certificate…" />
            </Field>
            <div className="a-form-grid">
              <Field label="Issued">
                <Input type="date" value={form.issued_at} onChange={(e) => set("issued_at", e.target.value)} />
              </Field>
              <Field label="Expires" optional>
                <Input type="date" value={form.expires_at} onChange={(e) => set("expires_at", e.target.value)} />
              </Field>
            </div>
            <div className="a-form-grid">
              <Field label="Credential number" optional hint="Dashboard only">
                <Input value={form.credential_id} onChange={(e) => set("credential_id", e.target.value)} />
              </Field>
              <Field label="Verification link" optional>
                <Input value={form.credential_url} onChange={(e) => set("credential_url", e.target.value)} placeholder="https://…" />
              </Field>
            </div>
            <div className="a-form-grid">
              <Field label="Order">
                <Input type="number" value={form.sort} onChange={(e) => set("sort", Number(e.target.value))} />
              </Field>
              <Field label="Visibility">
                <Toggle checked={form.published} onChange={(value) => set("published", value)} label="Published" />
              </Field>
            </div>
            <Field label="Highlight" hint="Featured certificates need an image">
              <Toggle checked={form.featured} onChange={(value) => set("featured", value)} label="Show as featured" />
            </Field>
          </div>
        </Drawer>
      )}
    </div>
  )
}
