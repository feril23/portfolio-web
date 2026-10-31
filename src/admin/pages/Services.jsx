import { useState } from "react"
import { getServices, servicesApi } from "../../lib/api.js"
import { useAdminLocale } from "../adminLocale.jsx"
import {
  Badge,
  Button,
  DemoBanner,
  Drawer,
  EmptyState,
  Field,
  Icons,
  Input,
  PageHeader,
  Spinner,
  Tag,
  TagInput,
  Textarea,
  Toggle,
  useAsync,
  useToast,
} from "../ui.jsx"

const blank = {
  title: "",
  description: "",
  deliverables: [],
  sort: 0,
  published: true,
}

export default function Services({ demo }) {
  const toast = useToast()
  const { locale } = useAdminLocale()
  const { data, error: loadError, loading, reload } = useAsync(() => getServices({ locale }), [locale])
  const services = data || []
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)

  const open = (row) => {
    setForm(row ? { ...row, deliverables: row.deliverables || [] } : { ...blank })
    setEditing(row || blank)
  }
  const close = () => setEditing(null)
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const save = async () => {
    if (!form.title.trim()) return toast("Service title is required.", "error")
    setSaving(true)
    try {
      await servicesApi.save({ ...form, sort: Number(form.sort) || 0 }, locale)
      toast("Service saved", "success")
      close()
      reload()
    } catch (error) {
      toast(error.message, "error")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (service) => {
    if (!window.confirm(`Delete “${service.title}”?`)) return
    try {
      await servicesApi.remove(service.id)
      toast("Service deleted", "success")
      reload()
    } catch (error) {
      toast(error.message, "error")
    }
  }

  return (
    <div className="admin-main">
      <PageHeader
        title="Services"
        sub="Capabilities and outcomes offered on the public site"
        actions={<Button variant="primary" icon={Icons.plus} onClick={() => open(null)}>New service</Button>}
      />
      <div className="admin-content admin-section-gap">
        {demo && <DemoBanner />}
        <div className="a-card">
          {loading ? (
            <Spinner />
          ) : loadError ? (
            <div className="a-card-body"><div className="a-error">Services could not be loaded. Run the latest Supabase schema or `20260726_services.sql`, then refresh this page.</div></div>
          ) : services.length === 0 ? (
            <EmptyState
              icon={Icons.services}
              title="No services yet"
              action={<Button variant="primary" icon={Icons.plus} onClick={() => open(null)}>Add a service</Button>}
            >
              Add the outcomes and capabilities you want to offer on the public site.
            </EmptyState>
          ) : (
            <div className="a-card-body" style={{ padding: "8px 4px" }}>
              <table className="a-table">
                <thead><tr><th style={{ width: 58 }}>Order</th><th>Service</th><th style={{ width: 260 }}>Deliverables</th><th style={{ width: 90 }}>Status</th><th style={{ width: 96 }} /></tr></thead>
                <tbody>
                  {services.map((service, index) => (
                    <tr key={service.id}>
                      <td className="a-muted">{String(index + 1).padStart(2, "0")}</td>
                      <td><div className="a-row-title">{service.title}</div><div className="a-row-sub">{service.description}</div></td>
                      <td><div className="a-tags">{(service.deliverables || []).map((item) => <Tag key={item}>{item}</Tag>)}</div></td>
                      <td><Badge tone={service.published ? "success" : "muted"} dot>{service.published ? "Live" : "Hidden"}</Badge></td>
                      <td><div className="a-row-actions"><Button variant="ghost" size="sm" icon={Icons.edit} onClick={() => open(service)} aria-label="Edit" /><Button variant="ghost" size="sm" icon={Icons.trash} onClick={() => remove(service)} aria-label="Delete" /></div></td>
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
          title={form.id ? "Edit service" : "New service"}
          subtitle={`Content for the ${locale.toUpperCase()} capability ledger`}
          onClose={close}
          footer={<><Button variant="ghost" className="spacer" onClick={close}>Cancel</Button><Button variant="primary" icon={Icons.check} onClick={save} loading={saving}>Save service</Button></>}
        >
          <div className="a-form-stack">
            <Field label="Title"><Input value={form.title} onChange={(event) => set("title", event.target.value)} placeholder="Product Strategy & UX" /></Field>
            <Field label="Description"><Textarea value={form.description} onChange={(event) => set("description", event.target.value)} placeholder="Describe the outcome and value of this service…" /></Field>
            <Field label="Deliverables" hint="Press Enter after each item"><TagInput value={form.deliverables || []} onChange={(value) => set("deliverables", value)} placeholder="Discovery, UX Audit, Prototyping" /></Field>
            <div className="a-form-grid">
              <Field label="Order" hint="Lower numbers appear first"><Input type="number" min="0" step="1" value={form.sort} onChange={(event) => set("sort", event.target.value)} /></Field>
              <Field label="Visibility"><Toggle checked={form.published} onChange={(value) => set("published", value)} label={form.published ? "Published" : "Hidden"} /></Field>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  )
}
