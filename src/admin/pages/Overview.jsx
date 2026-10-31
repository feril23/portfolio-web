import {
  getProjects,
  getExperience,
  getServices,
  getPosts,
  getProfile,
  getSkills,
  getSocials,
} from "../../lib/api.js"
import {
  PageHeader,
  Spinner,
  Icons,
  Badge,
  Button,
  BarChart,
  useAsync,
  DemoBanner,
} from "../ui.jsx"
import { navigate } from "../../lib/router.jsx"
import { useAdminLocale } from "../adminLocale.jsx"

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"
}
function today() {
  try {
    return new Date().toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  } catch {
    return ""
  }
}
function fmtDate(d) {
  if (!d) return "—"
  try {
    return new Date(d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return "—"
  }
}

const TINTS = ["indigo", "green", "amber", "blue", "indigo", "green"]

export default function Overview({ demo }) {
  const { locale } = useAdminLocale()
  const { data, loading } = useAsync(async () => {
    const [projects, experience, services, posts, profile, skills, socials] = await Promise.all([
      getProjects(locale),
      getExperience(locale),
      getServices({ locale }).catch(() => []),
      getPosts({ locale }),
      getProfile(locale),
      getSkills(locale),
      getSocials(locale),
    ])
    return { projects, experience, services, posts, profile, skills, socials }
  }, [locale])

  return (
    <div className="admin-main">
      <PageHeader title="Overview" sub="Your content at a glance" />
      <div className="admin-content admin-section-gap">
        {demo && <DemoBanner />}
        {loading ? (
          <Spinner />
        ) : (
          (() => {
            const posts = data.posts || []
            const projects = data.projects || []
            const experience = data.experience || []
            const services = data.services || []
            const skills = data.skills || []
            const socials = data.socials || []
            const published = posts.filter((p) => p.published)
            const drafts = posts.filter((p) => !p.published)
            const first = (data.profile?.name || "there").split(/\s+/)[0]
            const total =
              projects.length + posts.length + experience.length + services.length + skills.length + socials.length

            const pills = [
              { icon: Icons.work, label: "Projects", value: projects.length },
              { icon: Icons.post, label: "Published", value: published.length },
              { icon: Icons.edit, label: "Drafts", value: drafts.length },
              { icon: Icons.briefcase, label: "Experience", value: experience.length },
            ]
            const chartData = [
              { label: "Projects", value: projects.length },
              { label: "Posts", value: posts.length },
              { label: "Live", value: projects.filter((p) => p.href && p.href !== "#").length },
              { label: "Roles", value: experience.length },
              { label: "Services", value: services.length },
              { label: "Skills", value: skills.length },
              { label: "Links", value: socials.length },
            ]

            return (
              <>
                <div className="ov-hero">
                  <div>
                    <div className="ov-date">{today()}</div>
                    <h1 className="ov-title">
                      {greeting()}, {first}
                    </h1>
                    <p className="ov-lead">Here’s what’s happening across your portfolio.</p>
                  </div>
                  <div className="ov-hero-actions">
                    <Button variant="secondary" icon={Icons.external} onClick={() => navigate("/")}>
                      View site
                    </Button>
                    <Button variant="primary" icon={Icons.plus} onClick={() => navigate("/admin/posts/new")}>
                      New post
                    </Button>
                  </div>
                </div>

                <div className="ov-pills">
                  {pills.map((p) => (
                    <div className="ov-pill" key={p.label}>
                      <span className="ico"><p.icon /></span>
                      <span className="l">{p.label}</span>
                      <span className="v">{p.value}</span>
                    </div>
                  ))}
                </div>

                <div className="ov-grid">
                  <div className="ov-main admin-section-gap">
                    <div className="a-panel">
                      <div className="a-panel-head">
                        <span className="a-panel-label">Content overview</span>
                        <span className="a-viewall" onClick={() => navigate("/admin/work")}>Manage</span>
                      </div>
                      <div className="a-panel-body">
                        <div className="a-chart-head">
                          <div>
                            <div className="a-chart-value">{total}</div>
                            <div className="a-chart-delta">
                              {published.length} published · {drafts.length} drafts
                            </div>
                          </div>
                          <Badge tone="info" dot>Live</Badge>
                        </div>
                        <BarChart data={chartData} />
                      </div>
                    </div>

                    <div className="a-panel">
                      <div className="a-panel-head">
                        <span className="a-panel-label">Recent projects</span>
                        <span className="a-viewall" onClick={() => navigate("/admin/work")}>View all</span>
                      </div>
                      <div className="a-list">
                        {projects.length === 0 ? (
                          <div className="a-list-empty">No projects yet.</div>
                        ) : (
                          projects.slice(0, 4).map((p) => {
                            const live = p.href && p.href !== "#"
                            return (
                              <div className="a-list-item" key={p.id} onClick={() => navigate("/admin/work")}>
                                <span className="a-list-thumb">
                                  {p.image_url ? <img src={p.image_url} alt="" /> : <Icons.image />}
                                </span>
                                <div className="a-list-main">
                                  <div className="a-list-title">{p.title}</div>
                                  <div className="a-list-sub">{p.description}</div>
                                </div>
                                {live ? (
                                  <Badge tone="info" dot>Live</Badge>
                                ) : (
                                  <Badge tone="pending" dot>Concept</Badge>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ov-side admin-section-gap">
                    <div className="a-panel">
                      <div className="a-panel-head">
                        <span className="a-panel-label">Recent posts</span>
                        <span className="a-viewall" onClick={() => navigate("/admin/posts")}>View all</span>
                      </div>
                      <div className="a-list">
                        {posts.length === 0 ? (
                          <div className="a-list-empty">No posts yet.</div>
                        ) : (
                          posts.slice(0, 4).map((p) => (
                            <div className="a-list-item" key={p.id} onClick={() => navigate("/admin/posts/" + p.id)}>
                              <div className="a-list-main">
                                <div className="a-list-title">{p.title}</div>
                                <div className="a-list-sub">{fmtDate(p.published_at || p.created_at)}</div>
                              </div>
                              {p.published ? (
                                <Badge tone="success" dot>Published</Badge>
                              ) : (
                                <Badge tone="warn" dot>Draft</Badge>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="a-panel">
                      <div className="a-panel-head">
                        <span className="a-panel-label">Quick actions</span>
                      </div>
                      <div className="a-panel-body a-actions">
                        <button className="a-action" onClick={() => navigate("/admin/posts/new")}>
                          <span className="ico"><Icons.post /></span>
                          Write a post
                          <span className="go"><Icons.chevron /></span>
                        </button>
                        <button className="a-action" onClick={() => navigate("/admin/work")}>
                          <span className="ico"><Icons.work /></span>
                          Add a project
                          <span className="go"><Icons.chevron /></span>
                        </button>
                        <button className="a-action" onClick={() => navigate("/admin/profile")}>
                          <span className="ico"><Icons.user /></span>
                          Edit profile
                          <span className="go"><Icons.chevron /></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="a-panel">
                  <div className="a-panel-head">
                    <span className="a-panel-label">Gallery overview</span>
                    <span className="a-viewall" onClick={() => navigate("/admin/work")}>Manage gallery</span>
                  </div>
                  <div className="a-panel-body">
                    {projects.length === 0 ? (
                      <div className="a-list-empty" style={{ padding: 0 }}>No gallery items yet.</div>
                    ) : (
                      <div className="a-gallery">
                        {projects.slice(0, 6).map((p, i) => (
                          <div className={`a-gallery-item tint-${TINTS[i % TINTS.length]}`} key={p.id}>
                            {p.image_url ? (
                              <img src={p.image_url} alt={p.title} />
                            ) : (
                              <span className="a-gallery-ph">{(p.title || "?").slice(0, 1)}</span>
                            )}
                            <span className="a-gallery-cap">{p.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )
          })()
        )}
      </div>
    </div>
  )
}
