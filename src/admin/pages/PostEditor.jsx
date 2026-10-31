"use client"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { getPosts, postsApi, uploadImage, slugify, pairPosts, unpairPost } from "../../lib/api.js"
import { navigate } from "../../lib/router.jsx"
import { useAdminLocale } from "../adminLocale.jsx"
import {
  Button,
  Icons,
  Spinner,
  Field,
  Input,
  Textarea,
  Toggle,
  ImageUpload,
  Badge,
  DemoBanner,
  useToast,
} from "../ui.jsx"

// BlockNote touches the browser (window/document) at import time, so it must
// never run during SSR. Loading it via next/dynamic with { ssr: false } keeps
// the rest of the dashboard server-renderable while the editor stays
// client-only.
const BlockNoteEditor = dynamic(() => import("../BlockNoteEditor.jsx"), {
  ssr: false,
  loading: () => <Spinner />,
})

const blank = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_url: null,
  published: false,
}

export default function PostEditor({ demo, postId }) {
  const toast = useToast()
  const { locale } = useAdminLocale()
  const otherLocale = locale === "id" ? "en" : "id"
  const [loading, setLoading] = useState(!!postId)
  const [form, setForm] = useState(blank)
  const [otherPosts, setOtherPosts] = useState([])
  const [pairedId, setPairedId] = useState("")
  const [pairChoice, setPairChoice] = useState("")
  const [pairing, setPairing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [slugTouched, setSlugTouched] = useState(!!postId)

  useEffect(() => {
    let alive = true
    if (!postId) {
      setForm(blank)
      setPairedId("")
      setPairChoice("")
      getPosts({ locale: otherLocale }).then((rows) => alive && setOtherPosts(rows)).catch(() => {})
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([getPosts({ locale }), getPosts({ locale: otherLocale })])
      .then(([posts, candidates]) => {
        if (!alive) return
        const row = posts.find((p) => String(p.id) === String(postId))
        const paired = row?.translation_key
          ? candidates.find((candidate) => candidate.translation_key === row.translation_key)
          : null
        setForm(row ? { ...row } : blank)
        setOtherPosts(candidates)
        setPairedId(paired?.id || "")
        setPairChoice(paired?.id || "")
        setLoading(false)
      })
      .catch(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [postId, locale, otherLocale])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const onTitle = (v) =>
    setForm((f) => ({ ...f, title: v, slug: slugTouched ? f.slug : slugify(v) }))

  const back = () => navigate("/admin/posts")

  const save = async () => {
    setSaving(true)
    try {
      await postsApi.save(form, locale)
      toast("Post saved", "success")
      back()
    } catch (e) {
      toast(e.message, "error")
    } finally {
      setSaving(false)
    }
  }
  const remove = async () => {
    if (!form.id) return
    if (!window.confirm(`Delete \u201c${form.title}\u201d?`)) return
    try {
      await postsApi.remove(form.id)
      toast("Post deleted", "success")
      back()
    } catch (e) {
      toast(e.message, "error")
    }
  }
  const onUpload = async (file) => {
    setUploading(true)
    try {
      set("cover_url", await uploadImage(file))
    } catch (e) {
      toast(e.message, "error")
    } finally {
      setUploading(false)
    }
  }

  const connectPair = async () => {
    if (!form.id || !pairChoice) return
    setPairing(true)
    try {
      const translationKey = await pairPosts(form.id, pairChoice)
      set("translation_key", translationKey)
      setPairedId(pairChoice)
      toast("Bilingual articles connected", "success")
    } catch (e) {
      toast(e.message, "error")
    } finally {
      setPairing(false)
    }
  }

  const disconnectPair = async () => {
    if (!form.id || !pairedId) return
    if (!window.confirm("Disconnect this bilingual article pair?")) return
    setPairing(true)
    try {
      const translationKey = await unpairPost(form.id)
      set("translation_key", translationKey)
      setPairedId("")
      setPairChoice("")
      toast("Bilingual articles disconnected", "success")
    } catch (e) {
      toast(e.message, "error")
    } finally {
      setPairing(false)
    }
  }

  const pairedPost = otherPosts.find((post) => String(post.id) === String(pairedId))

  return (
    <div className="admin-main">
      <div className="editor-bar">
        <div className="editor-bar-inner">
          <div className="editor-lead">
            <button className="editor-back" onClick={back} aria-label="Back to blog">
              <Icons.chevron style={{ transform: "rotate(180deg)" }} />
            </button>
            <div>
              <div className="editor-eyebrow">Blog</div>
              <div className="editor-title">{postId ? "Edit post" : "New post"}</div>
            </div>
          </div>
          <div className="editor-actions">
            <Badge tone={form.published ? "success" : "warn"} dot>
              {form.published ? "Published" : "Draft"}
            </Badge>
            <Button variant="ghost" onClick={back}>
              Cancel
            </Button>
            <Button variant="primary" icon={Icons.check} onClick={save} loading={saving}>
              Save post
            </Button>
          </div>
        </div>
      </div>

      <div className="admin-content">
        {demo && <div style={{ marginBottom: 20 }}><DemoBanner /></div>}
        {loading ? (
          <Spinner />
        ) : (
          <div className="editor-grid">
            <div className="editor-main">
              <input
                className="editor-title-input"
                value={form.title}
                onChange={(e) => onTitle(e.target.value)}
                placeholder="Post title"
              />
              <BlockNoteEditor
                initialMarkdown={form.content}
                onChange={(md) => set("content", md)}
              />
            </div>

            <aside className="editor-side">
              <div className="a-panel">
                <div className="a-panel-head">
                  <span className="a-panel-label">Publish</span>
                </div>
                <div className="a-panel-body a-form-stack">
                  <Toggle
                    checked={form.published}
                    onChange={(v) => set("published", v)}
                    label={form.published ? "Published" : "Draft"}
                  />
                  <Field label="Slug" hint="Used in the post URL">
                    <Input
                      value={form.slug}
                      onChange={(e) => {
                        setSlugTouched(true)
                        set("slug", slugify(e.target.value))
                      }}
                      placeholder="a-great-title"
                    />
                  </Field>
                </div>
              </div>

              <div className="a-panel">
                <div className="a-panel-head">
                  <span className="a-panel-label">Language pairing</span>
                  <Badge tone={pairedPost ? "success" : "muted"} dot>{pairedPost ? "Connected" : "Not connected"}</Badge>
                </div>
                <div className="a-panel-body a-form-stack">
                  {!form.id ? (
                    <div className="editor-pairing-empty">Save this article first, then reopen it to connect its {otherLocale.toUpperCase()} version.</div>
                  ) : (
                    <>
                      {pairedPost && (
                        <div className="editor-pairing-status">
                          <div><strong>{pairedPost.title}</strong><span>{otherLocale.toUpperCase()} · /blog/{pairedPost.slug}</span></div>
                          <span className="editor-pairing-dot" aria-hidden="true" />
                        </div>
                      )}
                      {otherPosts.length ? (
                        <div className="editor-pairing-actions">
                          <select className="a-select" value={pairChoice} onChange={(e) => setPairChoice(e.target.value)} disabled={demo || pairing}>
                            <option value="">Select {otherLocale.toUpperCase()} article…</option>
                            {otherPosts.map((post) => <option key={post.id} value={post.id}>{post.title}</option>)}
                          </select>
                          <Button variant="secondary" size="sm" loading={pairing && pairChoice !== pairedId} disabled={demo || !pairChoice || pairChoice === pairedId || pairing} onClick={connectPair}>Connect</Button>
                        </div>
                      ) : (
                        <div className="editor-pairing-empty">No {otherLocale.toUpperCase()} articles are available yet.</div>
                      )}
                      {pairedPost && <Button variant="ghost" size="sm" loading={pairing && pairChoice === pairedId} disabled={demo || pairing} onClick={disconnectPair}>Disconnect pair</Button>}
                      <p className="editor-pairing-help">Pairing controls the language switcher, canonical links, and hreflang metadata. Connecting a new article replaces an older connection for these two posts.</p>
                    </>
                  )}
                </div>
              </div>

              <div className="a-panel">
                <div className="a-panel-head">
                  <span className="a-panel-label">Cover image</span>
                </div>
                <div className="a-panel-body">
                  <ImageUpload value={form.cover_url} onUpload={onUpload} uploading={uploading} />
                </div>
              </div>

              <div className="a-panel">
                <div className="a-panel-head">
                  <span className="a-panel-label">Excerpt</span>
                </div>
                <div className="a-panel-body">
                  <Textarea
                    value={form.excerpt}
                    onChange={(e) => set("excerpt", e.target.value)}
                    style={{ minHeight: 90 }}
                    placeholder="One or two sentences shown in the blog list\u2026"
                  />
                </div>
              </div>

              {form.id && (
                <Button variant="danger" icon={Icons.trash} onClick={remove} style={{ width: "100%" }}>
                  Delete post
                </Button>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
