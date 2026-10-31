import Blog from "../../../src/site/Blog.jsx"
import { getPosts, getUIStrings } from "../../../src/lib/api.js"
import { mergeUI } from "../../../src/i18n/ui.js"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }) {
  const { locale } = await params
  const overrides = await getUIStrings(locale).catch(() => ({}))
  const t = mergeUI(locale, overrides)
  return {
    title: t.meta.blogTitle,
    description: t.meta.blogDesc,
    alternates: {
      canonical: `/${locale}/blog`,
      languages: { id: "/id/blog", en: "/en/blog", "x-default": "/id/blog" },
    },
  }
}

export default async function BlogPage({ params }) {
  const { locale } = await params
  let posts = []
  try {
    posts = await getPosts({ publishedOnly: true, locale })
  } catch {
    posts = []
  }
  return <Blog posts={posts} />
}
