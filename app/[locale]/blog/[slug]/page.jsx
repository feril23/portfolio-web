import { redirect } from "next/navigation";
import BlogPost from "../../../../src/site/BlogPost.jsx";
import {
  getPostBySlug,
  getPostBySlugAnyLocale,
  getPostTranslation,
  getUIStrings,
} from "../../../../src/lib/api.js";
import { mergeUI } from "../../../../src/i18n/ui.js";

export const dynamic = "force-dynamic";

async function resolvePost(slug, locale) {
  const direct = await getPostBySlug(slug, locale);
  if (direct) return direct;
  const source = await getPostBySlugAnyLocale(slug);
  if (!source) return null;
  return (await getPostTranslation(source, locale)) || source;
}

async function alternatePosts(post) {
  if (!post) return { id: null, en: null };
  const [idPost, enPost] = await Promise.all([
    post.locale === "id" ? post : getPostTranslation(post, "id"),
    post.locale === "en" ? post : getPostTranslation(post, "en"),
  ]);
  return { id: idPost, en: enPost };
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const overrides = await getUIStrings(locale).catch(() => ({}));
  const t = mergeUI(locale, overrides);
  try {
    const post = await resolvePost(slug, locale);
    if (post) {
      const alternates = await alternatePosts(post);
      const languages = {};
      if (alternates.id) languages.id = `/id/blog/${alternates.id.slug}`;
      if (alternates.en) languages.en = `/en/blog/${alternates.en.slug}`;
      if (alternates.id)
        languages["x-default"] = `/id/blog/${alternates.id.slug}`;
      return {
        title: `${post.title} — Feril Ferdian`,
        description: post.excerpt || "",
        alternates: {
          canonical: `/${locale}/blog/${post.slug}`,
          languages,
        },
      };
    }
  } catch {}
  return { title: t.meta.postFallback };
}

export default async function BlogPostPage({ params }) {
  const { locale, slug } = await params;
  let post = null;
  try {
    post = await resolvePost(slug, locale);
  } catch {
    post = null;
  }
  if (post && post.locale === locale && post.slug !== slug) {
    redirect(`/${locale}/blog/${post.slug}`);
  }
  return <BlogPost post={post} slug={post?.slug || slug} />;
}
