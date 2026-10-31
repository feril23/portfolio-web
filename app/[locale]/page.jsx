import Home from "../../src/site/Home.jsx"
import { getPosts, getSiteContent, getUIStrings } from "../../src/lib/api.js"
import { seedSiteContent } from "../../src/lib/seed.js"
import { mergeUI } from "../../src/i18n/ui.js"

// Rendered on the server for SEO; falls back to bundled seed content in demo mode.
export const dynamic = "force-dynamic"

export async function generateMetadata({ params }) {
  const { locale } = await params
  const overrides = await getUIStrings(locale).catch(() => ({}))
  const t = mergeUI(locale, overrides)
  return {
    title: t.meta.homeTitle,
    description: t.meta.homeDesc,
    alternates: {
      canonical: `/${locale}`,
      languages: { id: "/id", en: "/en", "x-default": "/id" },
    },
  }
}

export default async function HomePage({ params }) {
  const { locale } = await params
  const [liveContent, posts] = await Promise.all([
    getSiteContent(locale).catch(() => null),
    getPosts({ publishedOnly: true, locale }).catch(() => []),
  ])
  const content = liveContent?.profile ? liveContent : seedSiteContent(locale)
  return <Home content={content} posts={posts.slice(0, 3)} />
}
