const PALETTES = [
  ["#182d29", "#dce8df"],
  ["#c8bca8", "#171715"],
  ["#243247", "#dfe6ef"],
  ["#7a302a", "#f1ddd4"],
  ["#d4d0c7", "#1c1c1a"],
]

function paletteFor(post) {
  const key = String(post?.slug || post?.title || "journal")
  let hash = 0
  for (let index = 0; index < key.length; index++) hash = (hash * 31 + key.charCodeAt(index)) >>> 0
  return PALETTES[hash % PALETTES.length]
}

function monogram(title) {
  return String(title || "Journal").trim().charAt(0).toUpperCase() || "J"
}

export default function CoverVisual({ post, eager = false }) {
  const [tone, ink] = paletteFor(post)
  return (
    <span className="cover-visual" style={{ "--cover-tone": tone, "--cover-ink": ink }}>
      {post?.cover_url ? (
        <img
          className="cover-visual-image"
          src={post.cover_url}
          alt=""
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable="false"
        />
      ) : (
        <span className="cover-visual-fallback">
          <span>Journal / Essay</span>
          <strong>{monogram(post?.title)}</strong>
          <i>{String(post?.slug || "entry").replaceAll("-", " / ")}</i>
        </span>
      )}
    </span>
  )
}
