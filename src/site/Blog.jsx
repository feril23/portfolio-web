"use client"
import { useEffect, useState } from "react"
import { getPosts } from "../lib/api.js"
import { Link } from "../lib/router.jsx"
import { useUI, useLocale } from "../i18n/context.jsx"
import { finishSharedTextTransitionToList } from "../lib/sharedTextTransition.js"

function formatDate(value, locale) {
  if (!value) return ""
  try {
    return new Date(value).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
      year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
    })
  } catch { return "" }
}

function readingTime(post, locale) {
  const words = `${post?.title || ""} ${post?.excerpt || ""} ${post?.content || ""}`.trim().split(/\s+/).length
  return `${Math.max(2, Math.ceil(words / 210))} ${locale === "id" ? "menit baca" : "min read"}`
}

export default function Blog({ posts: initial = null }) {
  const t = useUI()
  const locale = useLocale()
  const [posts, setPosts] = useState(initial)
  useEffect(() => {
    if (initial != null) return
    getPosts({ publishedOnly: true, locale }).then(setPosts).catch(() => setPosts([]))
  }, [initial, locale])

  useEffect(() => {
    if (posts?.length) finishSharedTextTransitionToList()
  }, [posts])

  const eyebrow = locale === "id" ? "Catatan tentang desain, kode, dan proses" : "Notes on design, code, and process"
  const intro = locale === "id"
    ? "Esai pendek, catatan kerja, dan hal-hal yang saya pelajari ketika mengubah ide menjadi produk digital."
    : "Short essays, working notes, and lessons learned while turning ideas into digital products."

  return (
    <main className="journal-page">
      <section className="journal-hero">
        <div className="container">
          <div className="journal-masthead" data-enter>
            <span>Journal / {new Date().getFullYear()}</span>
            <span>{eyebrow}</span>
          </div>
          <div className="journal-hero-grid">
            <h1 data-enter>{t.blog.title}</h1>
            <p data-enter>{intro}</p>
          </div>
        </div>
      </section>

      <section className="journal-feed">
        <div className="container">
          {posts === null ? (
            <p className="blog-empty">{t.blog.loading}</p>
          ) : posts.length === 0 ? (
            <div className="journal-empty"><span>00</span><p>{t.blog.empty}</p></div>
          ) : (
            <ol className="journal-list">
              {posts.map((post, index) => (
                <li key={post.id} data-reveal>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="journal-entry"
                    sharedTitle={{ selector: ".journal-entry-main > strong", post }}
                    data-hover
                  >
                    <span className="journal-entry-number">{String(index + 1).padStart(2, "0")}</span>
                    <span className="journal-entry-main">
                      <span className="journal-entry-meta">
                        <time>{formatDate(post.published_at || post.created_at, locale)}</time>
                        <span>{readingTime(post, locale)}</span>
                      </span>
                      <strong data-shared-list-title={post.slug}>{post.title}</strong>
                      <span className="journal-entry-excerpt">{post.excerpt}</span>
                    </span>
                    <span className="journal-entry-arrow" aria-hidden="true">↗</span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </main>
  )
}
