"use client"
import { useUI, useLocale } from "../i18n/context.jsx"
import { Link } from "../lib/router.jsx"
import { scrollToElement } from "../lib/scroll.js"
import HeroFigure from "./HeroFigure.jsx"

function formatDate(value, locale) {
  if (!value) return ""
  try {
    return new Date(value).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
      day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
    })
  } catch { return "" }
}

function readingTime(post, locale) {
  const words = `${post?.title || ""} ${post?.excerpt || ""} ${post?.content || ""}`.trim().split(/\s+/).length
  return `${Math.max(2, Math.ceil(words / 210))} ${locale === "id" ? "menit baca" : "min read"}`
}

function HeroTitle({ headline }) {
  const words = String(headline || "").split(" ")
  return (
    <h1 className="hero-title" aria-label={String(headline || "").replace(/\*/g, "")}>
      {words.map((word, index) => {
        const accent = word.startsWith("*") && word.endsWith("*")
        return (
          <span className="hero-word" key={`${word}-${index}`} aria-hidden="true">
            <span className={`hero-word-inner${accent ? " accent" : ""}`}>{word.replace(/\*/g, "")}</span>
          </span>
        )
      })}
    </h1>
  )
}

function ProjectImage({ project, index }) {
  if (project.image_url) {
    return <img className="project-image" src={project.image_url} alt="" loading="lazy" />
  }
  return (
    <span className="project-placeholder" aria-hidden="true">
      <span>{String(index + 1).padStart(2, "0")}</span>
      <strong>{project.title?.split(" ").map((word) => word[0]).join("").slice(0, 3)}</strong>
    </span>
  )
}

export default function Home({ content, posts = [] }) {
  const t = useUI()
  const locale = useLocale()
  const copy = locale === "id"
    ? { intro: "Membangun aplikasi web utuh, dari antarmuka sampai server.", profile: "Profil", selected: "Proyek", capabilities: "Teknologi", timeline: "Linimasa", notes: "Catatan terbaru", journalIntro: "Catatan tentang kode, proyek, dan proses di balik aplikasi yang saya bangun.", allWriting: "Lihat semua tulisan", start: "Mulai percakapan", index: "Fokus" }
    : { intro: "Building complete web apps, from interface to server.", profile: "Profile", selected: "Projects", capabilities: "Tech stack", timeline: "Timeline", notes: "Latest notes", journalIntro: "Notes on code, projects, and the process behind the apps I build.", allWriting: "View all writing", start: "Start a conversation", index: "Focus" }
  const { profile, keywords, about, skills, services, projects, experience } = content
  const [featuredPost, ...secondaryPosts] = posts
  // Links still pointing at a placeholder profile stay hidden until they're real.
  const socials = (profile?.socials || []).filter((social) => social.href && !/placeholder/i.test(social.href))

  return (
    <main>
      <section id="top" className="hero">
        <div className="container hero-container">
          <div className="hero-top" data-enter>
            <span className="hero-eyebrow">{profile?.role}</span>
            <span className="hero-loc">{profile?.location} / {new Date().getFullYear()}</span>
          </div>
          <div className="hero-main">
            <div className="hero-copy">
              <span className="hero-kicker" data-enter>{copy.intro}</span>
              <HeroTitle headline={profile?.headline} />
            </div>
            <HeroFigure />
          </div>
          <div className="hero-bottom" data-enter>
            <p className="hero-intro">{about?.paragraphs?.[0]}</p>
            <div className="hero-actions">
              <a href="#work" className="text-link text-link--primary" data-hover onClick={(event) => { event.preventDefault(); scrollToElement(document.getElementById("work")) }}>{t.hero.viewWork}<span>↓</span></a>
              <a href={`mailto:${profile?.email || ""}`} className="text-link" data-hover>{t.hero.getInTouch}<span>↗</span></a>
            </div>
          </div>
        </div>
      </section>

      <div className="practice-index" aria-label={copy.index}>
        <div className="container practice-index-inner">
          <span>{copy.index}</span>
          <div>{(keywords || []).slice(0, 6).map((item) => <span key={item}>{item}</span>)}</div>
        </div>
      </div>

      <section id="about" className="section about">
        <div className="container">
          <div className="section-meta"><span>{t.sections.about}</span><span>{copy.profile}</span></div>
          <div className="about-layout">
            <p className="about-statement" data-reveal>{about?.statement}</p>
            <div className="about-copy" data-reveal>{(about?.paragraphs || []).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
          </div>
          <div className="skills" data-reveal>
            <span className="skills-label">{copy.capabilities}</span>
            {(skills || []).map((skill) => (
              <div className="skill-group" key={skill.group}>
                <h3>{skill.group}</h3>
                <p>{(skill.items || []).join(" · ")}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="section capabilities">
        <div className="container">
          <div className="section-meta"><span>{t.services.label}</span><span>{t.services.meta}</span></div>
          <div className="capability-layout">
            <div className="capability-intro">
              <h2 data-split>{t.services.title}</h2>
              <p data-reveal>{t.services.intro}</p>
              <a className="text-link" href={`mailto:${profile?.email || ""}`} data-reveal data-hover>{t.services.cta}<span>↗</span></a>
            </div>
            {(services || []).length ? (
              <ol className="capability-list">
                {services.map((service, index) => (
                  <li
                    className="capability-item"
                    key={service.id || service.title}
                    data-capability-item
                    style={{
                      "--stack-index": index,
                      "--stack-offset": `${index * 12}px`,
                      "--stack-offset-mobile": `${index * 7}px`,
                      zIndex: index + 1,
                    }}
                  >
                    <span className="capability-index">{String(index + 1).padStart(2, "0")}</span>
                    <div className="capability-content">
                      <h3>{service.title}</h3>
                      <div className="capability-detail">
                        <p>{service.description}</p>
                        <div className="capability-scope">
                          <span>{t.services.scopeLabel}</span>
                          <ul>{(service.deliverables || []).map((item) => <li key={item}>{item}</li>)}</ul>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="capability-empty" data-reveal>{t.services.empty}</p>
            )}
          </div>
        </div>
      </section>

      <section id="work" className="section work">
        <div className="container">
          <div className="section-meta"><span>{t.sections.work}</span><span>{copy.selected}</span></div>
          <h2 className="section-title" data-split>{t.sections.workTitle}</h2>
          <div className="project-list">
            {(projects || []).map((project, index) => {
              const external = project.href && project.href !== "#"
              return (
                <a key={project.id || project.title} className="project-item" href={project.href || "#"} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} data-reveal data-hover>
                  <span className="project-media"><ProjectImage project={project} index={index} /></span>
                  <span className="project-info">
                    <span className="project-number">{project.year}</span>
                    <strong>{project.title}</strong>
                    <span className="project-desc">{project.description}</span>
                    <span className="project-tags">{(project.tags || []).join(" / ")}</span>
                  </span>
                  <span className="project-arrow">↗</span>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      <section id="experience" className="section experience">
        <div className="container">
          <div className="section-meta"><span>{t.sections.experience}</span><span>{copy.timeline}</span></div>
          <h2 className="section-title" data-split>{t.sections.experienceTitle}</h2>
          <ol className="timeline">
            {(experience || []).map((item) => (
              <li className="timeline-item" key={`${item.role}-${item.company}`} data-reveal>
                <span className="timeline-period">{item.period}</span>
                <div className="timeline-body"><div><h3>{item.role}</h3><span className="timeline-company">{item.company}</span></div><p>{item.description}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="journal" className="section home-journal">
        <div className="container">
          <div className="section-meta"><span>{t.blog.label}</span><span>{copy.notes}</span></div>
          <div className="home-journal-heading">
            <h2 className="section-title" data-split>{t.blog.title}</h2>
            <p data-reveal>{copy.journalIntro}</p>
          </div>

          {featuredPost ? (
            <div className="home-journal-grid">
              <Link
                to={`/blog/${featuredPost.slug}`}
                className="home-journal-feature"
                sharedTitle={{ selector: ".home-journal-title", post: featuredPost }}
                data-shared-entry
                data-reveal
                data-hover
              >
                <span className="home-journal-meta">
                  <span>{formatDate(featuredPost.published_at || featuredPost.created_at, locale)}</span>
                  <span>{readingTime(featuredPost, locale)}</span>
                </span>
                <strong className="home-journal-title">{featuredPost.title}</strong>
                <span className="home-journal-feature-foot">
                  <span>{featuredPost.excerpt}</span>
                  <i aria-hidden="true">↗</i>
                </span>
              </Link>

              <div className="home-journal-side">
                {secondaryPosts.map((post) => (
                  <Link
                    key={post.id || post.slug}
                    to={`/blog/${post.slug}`}
                    className="home-journal-item"
                    sharedTitle={{ selector: ".home-journal-item-title", post }}
                    data-shared-entry
                    data-reveal
                    data-hover
                  >
                    <span className="home-journal-meta">
                      <span>{formatDate(post.published_at || post.created_at, locale)}</span>
                      <span>{readingTime(post, locale)}</span>
                    </span>
                    <strong className="home-journal-item-title">{post.title}</strong>
                    <span className="home-journal-item-foot"><span>{post.excerpt}</span><i aria-hidden="true">↗</i></span>
                  </Link>
                ))}
                <Link to="/blog" className="home-journal-all" data-hover>
                  <span>{copy.allWriting}</span><span>↗</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="home-journal-empty" data-reveal><p>{t.blog.empty}</p><Link to="/blog" data-hover>{copy.allWriting} ↗</Link></div>
          )}
        </div>
      </section>

      <section id="contact" className="contact">
        <div className="container">
          <div className="section-meta"><span>{t.sections.contact}</span><span>{copy.start}</span></div>
          <h2 className="contact-title" data-split>{t.sections.contactTitle}</h2>
          <a className="contact-email" href={`mailto:${profile?.email || ""}`} data-hover><span>{profile?.email}</span><span>↗</span></a>
          <div className="contact-socials">{socials.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noreferrer" data-hover>{social.label}<span>↗</span></a>)}</div>
        </div>
      </section>
    </main>
  )
}
