import { getPosts, postsApi } from "../../lib/api.js"
import { navigate } from "../../lib/router.jsx"
import { useAdminLocale } from "../adminLocale.jsx"
import {
  PageHeader,
  Button,
  Icons,
  Spinner,
  EmptyState,
  Badge,
  DemoBanner,
  useAsync,
  useToast,
} from "../ui.jsx"

function fmtDate(d) {
  if (!d) return "\u2014"
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return "\u2014"
  }
}

export default function Posts({ demo }) {
  const toast = useToast()
  const { locale } = useAdminLocale()
  const { data: posts, loading, reload } = useAsync(() => getPosts({ locale }), [locale])

  const remove = async (e, row) => {
    e.stopPropagation()
    if (!window.confirm(`Delete \u201c${row.title}\u201d?`)) return
    try {
      await postsApi.remove(row.id)
      toast("Post deleted", "success")
      reload()
    } catch (err) {
      toast(err.message, "error")
    }
  }

  return (
    <div className="admin-main">
      <PageHeader
        title="Blog"
        sub="Write and publish posts"
        actions={
          <Button variant="primary" icon={Icons.plus} onClick={() => navigate("/admin/posts/new")}>
            New post
          </Button>
        }
      />
      <div className="admin-content">
        {demo && <div style={{ marginBottom: 20 }}><DemoBanner /></div>}
        <div className="a-panel">
          <div className="a-panel-head">
            <span className="a-panel-label">All posts</span>
            {!loading && posts && posts.length > 0 && (
              <span className="a-count-pill">{posts.length}</span>
            )}
          </div>
          {loading ? (
            <div style={{ padding: "16px 4px" }}><Spinner /></div>
          ) : posts.length === 0 ? (
            <EmptyState
              icon={Icons.post}
              title="No posts yet"
              action={
                <Button variant="primary" icon={Icons.plus} onClick={() => navigate("/admin/posts/new")}>
                  Write your first post
                </Button>
              }
            >
              Share updates, case studies, or notes. Drafts stay hidden until you publish.
            </EmptyState>
          ) : (
            <table className="a-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20 }}>Post</th>
                  <th style={{ width: 130 }}>Status</th>
                  <th style={{ width: 150 }}>Date</th>
                  <th style={{ width: 96, paddingRight: 20 }} />
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => navigate("/admin/posts/" + p.id)}>
                    <td style={{ paddingLeft: 20 }}>
                      <div className="a-row-title">{p.title}</div>
                      <div className="a-row-sub">{p.excerpt}</div>
                    </td>
                    <td>
                      {p.published ? (
                        <Badge tone="success" dot>Published</Badge>
                      ) : (
                        <Badge tone="warn" dot>Draft</Badge>
                      )}
                    </td>
                    <td className="a-muted">{fmtDate(p.published_at || p.created_at)}</td>
                    <td style={{ paddingRight: 20 }}>
                      <div className="a-row-actions">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Icons.edit}
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate("/admin/posts/" + p.id)
                          }}
                          aria-label="Edit"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Icons.trash}
                          onClick={(e) => remove(e, p)}
                          aria-label="Delete"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
