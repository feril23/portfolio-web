"use client"
import { useEffect, useMemo, useState } from "react"
import { auth } from "../../lib/api.js"
import { useAdminLocale } from "../adminLocale.jsx"
import { Badge, Button, DemoBanner, Field, Icons, Input, PageHeader, Textarea, useToast } from "../ui.jsx"

const RESOURCE_OPTIONS = [
  ["profile", "Profile"], ["services", "Services"], ["projects", "Projects"], ["experience", "Experience"],
  ["posts", "Blog"], ["skills", "Skills"], ["socials", "Socials"], ["translations", "Interface"],
]
const QUICK_PROMPTS = [
  "Audit semua konten dan temukan data yang belum lengkap, inkonsisten, atau terlalu generik.",
  "Perbaiki copy portfolio agar ringkas, spesifik, dan profesional tanpa mengubah fakta.",
  "Buat draft artikel baru berdasarkan topik dan gaya tulisan yang sudah ada.",
  "Terjemahkan konten yang belum memiliki pasangan bahasa dengan mempertahankan makna dan gaya.",
  "Temukan peluang SEO pada judul, excerpt, dan struktur artikel tanpa keyword stuffing.",
]
const STATUS_TONE = { planned: "pending", applied: "success", failed: "warn", rolled_back: "muted" }
const DEFAULT_SETTINGS_FORM = {
  provider: "openrouter",
  model: "openai/gpt-4.1-mini",
  apiKey: "",
  temperature: "0.2",
  maxTokens: "6000",
}

async function requestAI(payload) {
  const session = await auth.getSession()
  if (!session?.access_token) throw new Error("Sesi admin tidak tersedia. Silakan masuk kembali.")
  const response = await fetch("/api/admin-ai", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify(payload),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || data.details || "AI Assistant gagal memproses permintaan.")
  return data
}

function operationTitle(operation) {
  const verb = operation.action === "delete" ? "Delete" : operation.id ? "Update" : "Create"
  return `${verb} ${operation.resource}`
}
function formatDate(value) {
  try { return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) } catch { return "" }
}

export default function AIAssistant({ demo }) {
  const { locale } = useAdminLocale()
  const toast = useToast()
  const [prompt, setPrompt] = useState("")
  const [scopes, setScopes] = useState(RESOURCE_OPTIONS.map(([key]) => key))
  const [localeMode, setLocaleMode] = useState("current")
  const [plan, setPlan] = useState(null)
  const [selected, setSelected] = useState([])
  const [result, setResult] = useState(null)
  const [feedback, setFeedback] = useState("")
  const [history, setHistory] = useState([])
  const [savedPrompts, setSavedPrompts] = useState([])
  const [loading, setLoading] = useState("")
  const [error, setError] = useState("")
  const [settings, setSettings] = useState(null)
  const [settingsForm, setSettingsForm] = useState(DEFAULT_SETTINGS_FORM)
  const [settingsLoading, setSettingsLoading] = useState("")
  const [settingsError, setSettingsError] = useState("")

  useEffect(() => {
    try { setSavedPrompts(JSON.parse(localStorage.getItem("portfolio-ai-prompts") || "[]")) } catch {}
  }, [])

  const loadHistory = async () => {
    if (demo) return
    try { setHistory((await requestAI({ action: "history" })).runs || []) } catch {}
  }
  useEffect(() => { loadHistory() }, [demo]) // eslint-disable-line react-hooks/exhaustive-deps

  const syncSettings = (next) => {
    setSettings(next)
    setSettingsForm({
      provider: next.provider,
      model: next.model,
      apiKey: "",
      temperature: String(next.temperature),
      maxTokens: String(next.maxTokens),
    })
  }
  const loadSettings = async () => {
    if (demo) return
    setSettingsLoading("load"); setSettingsError("")
    try { syncSettings((await requestAI({ action: "settings:get" })).settings) }
    catch (err) { setSettingsError(err.message) }
    finally { setSettingsLoading("") }
  }
  useEffect(() => { loadSettings() }, [demo]) // eslint-disable-line react-hooks/exhaustive-deps

  const saveSettings = async (event) => {
    event.preventDefault()
    setSettingsLoading("save"); setSettingsError("")
    try {
      const data = await requestAI({
        action: "settings:save",
        settings: {
          ...settingsForm,
          temperature: Number(settingsForm.temperature),
          maxTokens: Number(settingsForm.maxTokens),
        },
      })
      syncSettings(data.settings)
      toast("Konfigurasi AI terenkripsi dan berhasil disimpan.", "success")
    } catch (err) { setSettingsError(err.message) }
    finally { setSettingsLoading("") }
  }

  const testSettings = async () => {
    setSettingsLoading("test"); setSettingsError("")
    try {
      const data = await requestAI({ action: "settings:test" })
      toast(`Koneksi ${data.provider} berhasil dengan ${data.model}.`, "success")
    } catch (err) { setSettingsError(err.message) }
    finally { setSettingsLoading("") }
  }

  const resetSettings = async () => {
    if (!window.confirm("Hapus konfigurasi dashboard dan kembali memakai environment server?")) return
    setSettingsLoading("reset"); setSettingsError("")
    try {
      syncSettings((await requestAI({ action: "settings:reset" })).settings)
      toast("Konfigurasi AI kembali menggunakan environment server.", "success")
    } catch (err) { setSettingsError(err.message) }
    finally { setSettingsLoading("") }
  }

  const changeProvider = (provider) => {
    const selectedProvider = settings?.providers?.find((item) => item.id === provider)
    setSettingsForm((current) => ({
      ...current,
      provider,
      model: selectedProvider?.defaultModel || current.model,
    }))
  }

  const counts = useMemo(() => {
    const active = new Set(selected)
    return (plan?.operations || []).reduce((total, operation, index) => {
      if (!active.has(index)) return total
      if (operation.action === "delete") total.remove += 1
      else if (operation.id) total.update += 1
      else total.create += 1
      return total
    }, { create: 0, update: 0, remove: 0 })
  }, [plan, selected])

  const usePlan = (nextPlan) => {
    setPlan(nextPlan)
    setSelected(nextPlan.operations.map((_, index) => index))
    setResult(null)
    setFeedback("")
  }

  const generatePlan = async () => {
    setError(""); setLoading("plan"); setResult(null)
    try { usePlan(await requestAI({ action: "plan", prompt, locale, scopes, localeMode })) }
    catch (err) { setError(err.message) }
    finally { setLoading("") }
  }

  const refinePlan = async () => {
    setError(""); setLoading("refine")
    try { usePlan(await requestAI({ action: "refine", runId: plan.runId, feedback })) }
    catch (err) { setError(err.message) }
    finally { setLoading("") }
  }

  const applyPlan = async () => {
    setError(""); setLoading("apply")
    try {
      const applied = await requestAI({ action: "apply", runId: plan.runId, selectedIndexes: selected })
      setResult(applied)
      toast(applied.failed ? `${applied.applied} diterapkan, ${applied.failed} gagal.` : `${applied.applied} perubahan berhasil diterapkan.`, applied.failed ? "error" : "success")
      loadHistory()
    } catch (err) { setError(err.message) }
    finally { setLoading("") }
  }

  const rollback = async (runId) => {
    if (!window.confirm("Rollback semua perubahan yang berhasil dari AI run ini?")) return
    setLoading(`rollback:${runId}`); setError("")
    try {
      const data = await requestAI({ action: "rollback", runId })
      toast(data.failed ? "Sebagian rollback gagal." : "Perubahan berhasil dikembalikan.", data.failed ? "error" : "success")
      loadHistory()
    } catch (err) { setError(err.message) }
    finally { setLoading("") }
  }

  const toggleScope = (key) => setScopes((current) => current.includes(key)
    ? current.length === 1 ? current : current.filter((item) => item !== key)
    : [...current, key])
  const toggleOperation = (index) => setSelected((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])

  const savePrompt = () => {
    const value = prompt.trim()
    if (!value || savedPrompts.includes(value)) return
    const next = [value, ...savedPrompts].slice(0, 8)
    setSavedPrompts(next)
    localStorage.setItem("portfolio-ai-prompts", JSON.stringify(next))
    toast("Prompt disimpan.", "success")
  }
  const removeSavedPrompt = (value) => {
    const next = savedPrompts.filter((item) => item !== value)
    setSavedPrompts(next)
    localStorage.setItem("portfolio-ai-prompts", JSON.stringify(next))
  }
  const reset = () => { setPlan(null); setResult(null); setFeedback(""); setError("") }

  return (
    <div className="admin-main">
      <PageHeader title="AI Assistant" sub="Plan, refine, approve, and roll back content changes" />
      <div className="admin-content admin-section-gap ai-admin">
        {demo && <DemoBanner />}
        <section className="ai-hero">
          <div className="ai-hero-mark"><Icons.sparkle /></div>
          <div><span className="ai-eyebrow">{settings?.providerLabel || "AI provider"} · Human-in-the-loop</span><h1>Your private content operator.</h1><p>Work across your entire portfolio, choose exactly what AI may read, refine its plan, apply selected changes, and roll them back from history.</p></div>
        </section>

        <section className="a-panel ai-settings">
          <div className="a-panel-head">
            <div><span className="a-panel-label">Model connection</span><p>Server-only credentials for the AI content operator.</p></div>
            <Badge tone={settings?.hasApiKey ? "success" : "warn"} dot>{settings?.source || (settingsLoading === "load" ? "loading" : "not configured")}</Badge>
          </div>
          <div className="a-panel-body ai-settings-layout">
            <div className="ai-settings-security">
              <Icons.lock />
              <div><strong>Encrypted credentials</strong><p>API keys are encrypted with AES-256-GCM and never returned to this browser. Only the final four characters are stored separately for identification.</p></div>
              <dl>
                <div><dt>Active provider</dt><dd>{settings?.providerLabel || "—"}</dd></div>
                <div><dt>Active model</dt><dd>{settings?.model || "—"}</dd></div>
                <div><dt>API key</dt><dd>{settings?.hasApiKey ? `•••• ${settings.keyHint}` : "Not configured"}</dd></div>
              </dl>
            </div>

            <form className="ai-settings-form" onSubmit={saveSettings}>
              {!demo && settings && !settings.storageReady && <div className="ai-settings-blocked"><Icons.info /><span>{settings.storageMessage}</span></div>}
              <div className="ai-settings-fields">
                <Field label="Provider">
                  <select className="a-select" value={settingsForm.provider} onChange={(event) => changeProvider(event.target.value)} disabled={demo || !settings?.storageReady || !!settingsLoading}>
                    {(settings?.providers || []).map((provider) => <option key={provider.id} value={provider.id}>{provider.label}</option>)}
                  </select>
                </Field>
                <Field label="Model" hint="Use the exact model ID published by the provider.">
                  <Input value={settingsForm.model} onChange={(event) => setSettingsForm((current) => ({ ...current, model: event.target.value }))} placeholder="Provider model ID" disabled={demo || !settings?.storageReady || !!settingsLoading} required />
                </Field>
                <Field label="API key" hint={settings?.hasApiKey ? `Stored key ends in ${settings.keyHint}. Leave blank to keep it.` : "The key is encrypted before it is stored."}>
                  <Input type="password" autoComplete="new-password" spellCheck="false" value={settingsForm.apiKey} onChange={(event) => setSettingsForm((current) => ({ ...current, apiKey: event.target.value }))} placeholder={settings?.hasApiKey ? "Leave blank to keep stored key" : "Paste provider API key"} disabled={demo || !settings?.storageReady || !!settingsLoading} />
                </Field>
                <div className="ai-settings-numbers">
                  <Field label="Temperature">
                    <Input type="number" min="0" max="2" step="0.1" value={settingsForm.temperature} onChange={(event) => setSettingsForm((current) => ({ ...current, temperature: event.target.value }))} disabled={demo || !settings?.storageReady || !!settingsLoading} required />
                  </Field>
                  <Field label="Max tokens">
                    <Input type="number" min="256" max="16000" step="1" value={settingsForm.maxTokens} onChange={(event) => setSettingsForm((current) => ({ ...current, maxTokens: event.target.value }))} disabled={demo || !settings?.storageReady || !!settingsLoading} required />
                  </Field>
                </div>
              </div>
              {settingsError && <div className="ai-error"><Icons.info />{settingsError}</div>}
              <div className="ai-settings-actions">
                <Button type="button" variant="secondary" loading={settingsLoading === "test"} disabled={demo || !settings?.hasApiKey || !!settingsLoading} onClick={testSettings}>Test saved connection</Button>
                {settings?.source === "dashboard" && <Button type="button" variant="ghost" disabled={!!settingsLoading} onClick={resetSettings}>Use environment</Button>}
                <Button type="submit" variant="primary" loading={settingsLoading === "save"} disabled={demo || !settings?.storageReady || !settingsForm.model.trim() || !!settingsLoading}>Save securely</Button>
              </div>
            </form>
          </div>
        </section>

        {!plan ? (
          <>
            <div className="ai-layout">
              <section className="a-panel ai-composer">
                <div className="a-panel-head"><span className="a-panel-label">What should AI do?</span><Badge tone="accent" dot>{locale.toUpperCase()} context</Badge></div>
                <div className="a-panel-body">
                  <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") generatePlan() }} placeholder="Contoh: audit portfolio, rapikan proyek yang terlalu generik, dan buat draft artikel dari tema pekerjaan saya…" rows={9} disabled={demo || !!loading} />
                  <div className="ai-composer-foot"><div><span>{prompt.length} characters · ⌘/Ctrl + Enter</span><button className="ai-text-action" onClick={savePrompt} disabled={!prompt.trim()}>Save prompt</button></div><Button variant="primary" icon={Icons.sparkle} loading={loading === "plan"} disabled={demo || prompt.trim().length < 8 || !!loading} onClick={generatePlan}>Generate plan</Button></div>
                  {error && <div className="ai-error"><Icons.info />{error}</div>}
                </div>
              </section>

              <aside className="a-panel ai-context">
                <div className="a-panel-head"><span className="a-panel-label">AI context</span></div>
                <div className="a-panel-body">
                  <label className="ai-control-label">Data access</label>
                  <div className="ai-scope-grid">{RESOURCE_OPTIONS.map(([key, label]) => <button key={key} className={scopes.includes(key) ? "is-active" : ""} onClick={() => toggleScope(key)}><span />{label}</button>)}</div>
                  <label className="ai-control-label">Languages</label>
                  <div className="ai-segment"><button className={localeMode === "current" ? "is-active" : ""} onClick={() => setLocaleMode("current")}>Current · {locale.toUpperCase()}</button><button className={localeMode === "all" ? "is-active" : ""} onClick={() => setLocaleMode("all")}>ID + EN</button></div>
                  <div className="ai-safety"><Icons.lock /><div><strong>Scoped and approval-based.</strong><span>Only selected resources are sent as context. No write happens before confirmation.</span></div></div>
                </div>
              </aside>
            </div>

            <div className="ai-secondary-grid">
              <section className="a-panel ai-quick"><div className="a-panel-head"><span className="a-panel-label">Quick prompts</span></div><div className="ai-quick-list">{QUICK_PROMPTS.map((item) => <button key={item} onClick={() => { setPrompt(item); if (/terjemah/i.test(item)) setLocaleMode("all") }} disabled={demo}><Icons.sparkle /><span>{item}</span><Icons.chevron /></button>)}</div></section>
              <section className="a-panel ai-library"><div className="a-panel-head"><span className="a-panel-label">Saved prompts</span></div>{savedPrompts.length ? <div className="ai-library-list">{savedPrompts.map((item) => <div key={item}><button onClick={() => setPrompt(item)}>{item}</button><button aria-label="Delete saved prompt" onClick={() => removeSavedPrompt(item)}><Icons.trash /></button></div>)}</div> : <div className="ai-empty-plan">Save reusable instructions for your personal workflow.</div>}</section>
            </div>
          </>
        ) : (
          <div className="ai-plan-layout">
            <section className="a-panel ai-plan">
              <div className="a-panel-head"><div><span className="a-panel-label">Proposed change plan</span><p className="ai-plan-summary">{plan.summary}</p></div><Badge tone="pending" dot>Awaiting approval</Badge></div>
              <div className="ai-plan-toolbar"><button onClick={() => setSelected(plan.operations.map((_, i) => i))}>Select all</button><button onClick={() => setSelected([])}>Clear</button><span>{selected.length} of {plan.operations.length} selected</span></div>
              <div className="ai-plan-stats"><span><strong>{counts.create}</strong>create</span><span><strong>{counts.update}</strong>update</span><span><strong>{counts.remove}</strong>delete</span></div>
              {plan.warnings?.length > 0 && <div className="ai-warnings">{plan.warnings.map((warning, i) => <div key={i}><Icons.info />{warning}</div>)}</div>}
              <div className="ai-operations">{plan.operations.length ? plan.operations.map((operation, index) => (
                <article className={`ai-operation${selected.includes(index) ? " is-selected" : ""}`} key={`${operation.resource}-${operation.id || index}`}>
                  <label className="ai-operation-select"><input type="checkbox" checked={selected.includes(index)} onChange={() => toggleOperation(index)} /><span>{String(index + 1).padStart(2, "0")}</span></label>
                  <div className="ai-operation-main"><div className="ai-operation-head"><strong>{operationTitle(operation)}</strong><div><Badge tone={operation.action === "delete" ? "warn" : operation.id ? "info" : "success"}>{operation.locale.toUpperCase()}</Badge>{operation.sourceId && <Badge tone="accent">Translation copy</Badge>}{operation.id && <code>{operation.id.slice(0, 8)}</code>}</div></div><p>{operation.reason}</p>{operation.action !== "delete" && <pre>{JSON.stringify(operation.values, null, 2)}</pre>}</div>
                </article>
              )) : <div className="ai-empty-plan">AI tidak menemukan perubahan yang perlu diterapkan.</div>}</div>
            </section>

            <aside className="ai-plan-side admin-section-gap">
              <section className="a-panel ai-approval"><div className="a-panel-body"><span className="ai-eyebrow">Final confirmation</span><h3>Review before applying</h3><p>Only checked operations will be written. Every successful change can be rolled back from history.</p>{result ? <div className={`ai-result ${result.failed ? "is-partial" : "is-success"}`}><Icons.check /><div><strong>{result.applied} applied</strong><span>{result.skipped ? `${result.skipped} skipped. ` : ""}{result.failed ? `${result.failed} failed.` : "Rollback is available."}</span></div></div> : <Button variant="primary" icon={Icons.check} loading={loading === "apply"} disabled={!selected.length || !!loading} onClick={applyPlan}>Apply selected</Button>}<Button variant="secondary" onClick={reset} disabled={loading === "apply"}>{result ? "Start new request" : "Discard plan"}</Button>{error && <div className="ai-error"><Icons.info />{error}</div>}</div></section>
              {!result && <section className="a-panel ai-refine"><div className="a-panel-head"><span className="a-panel-label">Refine this plan</span></div><div className="a-panel-body"><Textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Contoh: jangan ubah profile, buat artikelnya lebih personal…" /><Button variant="secondary" icon={Icons.sparkle} loading={loading === "refine"} disabled={feedback.trim().length < 4 || !!loading} onClick={refinePlan}>Regenerate plan</Button></div></section>}
            </aside>
          </div>
        )}

        <section className="a-panel ai-history"><div className="a-panel-head"><span className="a-panel-label">AI activity</span><button className="ai-text-action" onClick={loadHistory}>Refresh</button></div>{history.length ? <div className="ai-history-list">{history.map((run) => <article key={run.id}><div className="ai-history-status"><Badge tone={STATUS_TONE[run.status] || "muted"} dot>{run.status.replace("_", " ")}</Badge><span>{formatDate(run.created_at)}</span></div><div className="ai-history-main"><strong>{run.summary || run.prompt}</strong><p>{run.prompt}</p><span>{run.operations?.length || 0} operations · {run.locale.toUpperCase()} · {run.scope?.provider || "openrouter"} / {run.model}</span></div>{["applied", "failed"].includes(run.status) && <Button variant="secondary" size="sm" loading={loading === `rollback:${run.id}`} disabled={!!loading} onClick={() => rollback(run.id)}>Rollback</Button>}</article>)}</div> : <div className="ai-empty-plan">Your generated plans and applied changes will appear here.</div>}</section>
      </div>
    </div>
  )
}
