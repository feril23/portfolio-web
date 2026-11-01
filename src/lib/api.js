import { supabase, isSupabaseConfigured, MEDIA_BUCKET } from "./supabase.js"
import { getData } from "../data.js"
import { defaultLocale, locales } from "../i18n/config.js"

// ---------------------------------------------------------------------------
//  Data access layer.
//  Every function returns a Promise and works in two modes:
//   - Supabase configured  -> reads/writes the database
//   - Demo mode (no env)    -> reads bundled seed content; writes are blocked
//                              with a friendly error so the UI can explain.
//
//  LOCALIZATION: content is stored per-locale (a `locale` column on every
//  table). Reads/writes take a `locale` argument so each language is managed
//  independently. Interface copy lives in the `translations` table as JSON.
// ---------------------------------------------------------------------------

export const DEMO = !isSupabaseConfigured

function demoError() {
  return new Error(
    "Demo mode: connect Supabase (add your .env keys) to save changes."
  )
}

const slugify = (s) =>
  (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

export { slugify }

// ---------- Seed shaping (demo mode) ---------------------------------
const seedStates = {}

function seedPosts(lc) {
  if (lc === "id") {
    return [
      {
        id: "post-1",
        locale: "id",
        title: "Mendesain dengan menahan diri",
        slug: "designing-with-restraint",
        excerpt:
          "Kenapa antarmuka terbaik justru \"menghilang\" \u2014 catatan tentang kejernihan, hierarki, dan melakukan lebih sedikit.",
        content:
          "# Mendesain dengan menahan diri\n\nDesain yang baik sering kali soal apa yang kita tinggalkan. Di tulisan ini saya menjelaskan cara saya menyederhanakan sebuah antarmuka ke esensinya tanpa kehilangan karakter.\n\n## Mulai dari hierarki\n\nSetiap layar punya satu tugas. Temukan, buat jelas, dan biarkan sisanya mundur ke belakang.\n\n## Tipografi yang bekerja keras\n\nSkala tipografi yang dipikirkan matang menghapus kebutuhan akan sebagian besar elemen dekoratif.",
        cover_url: null,
        published: true,
        published_at: "2025-11-02T09:00:00Z",
        created_at: "2025-11-02T09:00:00Z",
      },
      {
        id: "post-2",
        locale: "id",
        title: "Membangun lapisan motion yang menghormati pengguna",
        slug: "motion-that-respects-users",
        excerpt:
          "Menambahkan motion bertenaga GSAP sambil tetap cepat, aksesibel, dan ramah reduced-motion.",
        content:
          "# Motion yang menghormati pengguna\n\nMotion harus menuntun perhatian, bukan berebut perhatian. Berikut cara saya menempatkan animasi sebagai peningkatan bertahap.\n\n## Konten dulu\n\nSemuanya tetap terbaca tanpa JavaScript. Motion hanya memperkaya.\n\n## Hormati prefers-reduced-motion\n\nSelalu sediakan alternatif yang tenang.",
        cover_url: null,
        published: true,
        published_at: "2025-09-18T09:00:00Z",
        created_at: "2025-09-18T09:00:00Z",
      },
    ]
  }
  return [
    {
      id: "post-1",
      locale: "en",
      title: "Designing with restraint",
      slug: "designing-with-restraint",
      excerpt:
        "Why the best interfaces disappear \u2014 notes on clarity, hierarchy, and doing less.",
      content:
        "# Designing with restraint\n\nGood design is often about what you leave out. In this post I walk through how I approach reducing an interface to its essentials without losing personality.\n\n## Start with hierarchy\n\nEvery screen has one job. Find it, make it obvious, and let everything else recede.\n\n## Type does the heavy lifting\n\nA considered type scale removes the need for most decorative elements.",
      cover_url: null,
      published: true,
      published_at: "2025-11-02T09:00:00Z",
      created_at: "2025-11-02T09:00:00Z",
    },
    {
      id: "post-2",
      locale: "en",
      title: "Building a motion layer that respects users",
      slug: "motion-that-respects-users",
      excerpt:
        "Adding GSAP-powered motion while keeping things fast, accessible, and reduced-motion friendly.",
      content:
        "# Motion that respects users\n\nMotion should guide attention, not fight for it. Here's how I layer animation as progressive enhancement.\n\n## Content-first\n\nEverything is readable without JavaScript. Motion only enhances.\n\n## Honor prefers-reduced-motion\n\nAlways provide a calm fallback.",
      cover_url: null,
      published: true,
      published_at: "2025-09-18T09:00:00Z",
      created_at: "2025-09-18T09:00:00Z",
    },
  ]
}

function seedData(locale = defaultLocale) {
  const lc = locale || defaultLocale
  if (seedStates[lc]) return seedStates[lc]
  const d = getData(lc)
  seedStates[lc] = {
    profile: {
      id: "seed-profile-" + lc,
      locale: lc,
      name: d.profile.name,
      initials: d.profile.initials,
      role: d.profile.role,
      roles: d.profile.roles || [],
      headline: d.profile.headline,
      statement: d.about.statement,
      paragraphs: d.about.paragraphs,
      keywords: d.keywords,
      location: d.profile.location,
      availability: d.profile.availability,
      email: d.profile.email,
    },
    socials: d.profile.socials.map((s, i) => ({ id: "s" + i, locale: lc, ...s, sort: i })),
    skills: d.skills.map((s, i) => ({ id: "sk" + i, locale: lc, ...s, sort: i })),
    services: d.services.map((service, i) => ({
      id: "sv" + i,
      locale: lc,
      translation_key: `seed-service-${i}`,
      sort: i,
      published: true,
      ...service,
    })),
    projects: d.projects.map((p, i) => ({
      id: "p" + i,
      locale: lc,
      image_url: null,
      sort: i,
      ...p,
    })),
    experience: d.experience.map((e, i) => ({ id: "e" + i, locale: lc, sort: i, ...e })),
    posts: seedPosts(lc),
  }
  return seedStates[lc]
}

// ---------- Reads -----------------------------------------------------
export async function getProfile(locale = defaultLocale) {
  if (DEMO) return seedData(locale).profile
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("locale", locale)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getSocials(locale = defaultLocale) {
  if (DEMO) return seedData(locale).socials
  const { data, error } = await supabase.from("socials").select("*").eq("locale", locale).order("sort")
  if (error) throw error
  return data
}

export async function getSkills(locale = defaultLocale) {
  if (DEMO) return seedData(locale).skills
  const { data, error } = await supabase.from("skills").select("*").eq("locale", locale).order("sort")
  if (error) throw error
  return data
}

export async function getServices({ publishedOnly = false, locale = defaultLocale } = {}) {
  if (DEMO) {
    const services = seedData(locale).services
    return publishedOnly ? services.filter((service) => service.published) : services
  }
  let query = supabase.from("services").select("*").eq("locale", locale).order("sort")
  if (publishedOnly) query = query.eq("published", true)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getProjects(locale = defaultLocale) {
  if (DEMO) return seedData(locale).projects
  const { data, error } = await supabase.from("projects").select("*").eq("locale", locale).order("sort")
  if (error) throw error
  return data
}

export async function getExperience(locale = defaultLocale) {
  if (DEMO) return seedData(locale).experience
  const { data, error } = await supabase.from("experience").select("*").eq("locale", locale).order("sort")
  if (error) throw error
  return data
}

export async function getCertifications({ publishedOnly = false, locale = defaultLocale } = {}) {
  if (DEMO) return []
  let query = supabase.from("certifications").select("*").eq("locale", locale).order("sort")
  if (publishedOnly) query = query.eq("published", true)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getPosts({ publishedOnly = false, locale = defaultLocale } = {}) {
  if (DEMO) {
    const posts = seedData(locale).posts
    return publishedOnly ? posts.filter((p) => p.published) : posts
  }
  let q = supabase
    .from("posts")
    .select("*")
    .eq("locale", locale)
    .order("published_at", { ascending: false })
  if (publishedOnly) q = q.eq("published", true)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function getPostBySlug(slug, locale = defaultLocale) {
  if (DEMO) return seedData(locale).posts.find((p) => p.slug === slug) || null
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("locale", locale)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getPostBySlugAnyLocale(slug) {
  if (DEMO) {
    for (const locale of locales) {
      const post = seedData(locale).posts.find((item) => item.slug === slug)
      if (post) return post
    }
    return null
  }
  const { data, error } = await supabase.from("posts").select("*").eq("slug", slug).limit(1)
  if (error) throw error
  return data?.[0] || null
}

function normalizedPostContent(value) {
  return String(value || "").replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim()
}

// Resolve the same logical article in another language. translation_key is the
// canonical pairing; exact normalized content and slug are safe fallbacks for
// articles created before translation pairing existed.
export function findPostTranslationCandidate(post, candidates = []) {
  if (!post) return null
  if (post.translation_key) {
    const paired = candidates.find((item) => item.translation_key === post.translation_key)
    if (paired) return paired
  }
  const content = normalizedPostContent(post.content)
  if (content) {
    const identical = candidates.find((item) => normalizedPostContent(item.content) === content)
    if (identical) return identical
  }
  return candidates.find((item) => item.slug === post.slug) || null
}

export async function getPostTranslation(post, targetLocale) {
  if (!post || !locales.includes(targetLocale)) return null
  const candidates = await getPosts({ publishedOnly: !!post.published, locale: targetLocale })
  return findPostTranslationCandidate(post, candidates)
}

// Interface copy overrides for a locale (empty object when none saved yet).
export async function getUIStrings(locale = defaultLocale) {
  if (DEMO) return {}
  const { data, error } = await supabase
    .from("translations")
    .select("data")
    .eq("locale", locale)
    .maybeSingle()
  if (error) throw error
  return data?.data || {}
}

// Bundle everything the public site needs in one call.
export async function getSiteContent(locale = defaultLocale) {
  const [profile, socials, skills, services, projects, experience, certifications] = await Promise.all([
    getProfile(locale),
    getSocials(locale),
    getSkills(locale),
    getServices({ publishedOnly: true, locale }).catch(() => []),
    getProjects(locale),
    getExperience(locale),
    getCertifications({ publishedOnly: true, locale }).catch(() => []),
  ])
  return {
    profile: {
      ...profile,
      socials,
    },
    keywords: profile?.keywords || [],
    about: {
      statement: profile?.statement || "",
      paragraphs: profile?.paragraphs || [],
    },
    skills,
    services,
    projects,
    experience,
    certifications,
  }
}

// ---------- Writes ----------------------------------------------------
export async function saveProfile(patch, locale = defaultLocale) {
  if (DEMO) throw demoError()
  const existing = await getProfile(locale)
  const payload = { ...patch, locale, updated_at: new Date().toISOString() }
  if (existing?.id) {
    const { data, error } = await supabase
      .from("profile")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  }
  const { data, error } = await supabase.from("profile").insert(payload).select().single()
  if (error) throw error
  return data
}

export async function saveUIStrings(locale, data) {
  if (DEMO) throw demoError()
  const { error } = await supabase
    .from("translations")
    .upsert({ locale, data, updated_at: new Date().toISOString() }, { onConflict: "locale" })
  if (error) throw error
}

function makeCrud(table) {
  return {
    async save(row, locale = defaultLocale) {
      if (DEMO) throw demoError()
      const { id, ...rest } = row
      const payload = { ...rest, locale }
      if (id) {
        const { data, error } = await supabase.from(table).update(payload).eq("id", id).select().single()
        if (error) throw error
        return data
      }
      const { data, error } = await supabase.from(table).insert(payload).select().single()
      if (error) throw error
      return data
    },
    async remove(id) {
      if (DEMO) throw demoError()
      const { error } = await supabase.from(table).delete().eq("id", id)
      if (error) throw error
    },
  }
}

export const projectsApi = makeCrud("projects")
export const experienceApi = makeCrud("experience")
export const certificationsApi = makeCrud("certifications")
export const skillsApi = makeCrud("skills")
export const servicesApi = makeCrud("services")
export const socialsApi = makeCrud("socials")

export const postsApi = {
  async save(row, locale = defaultLocale) {
    if (DEMO) throw demoError()
    const payload = { ...row, locale }
    if (!payload.slug) payload.slug = slugify(payload.title)
    if (payload.published && !payload.published_at) {
      payload.published_at = new Date().toISOString()
    }
    const { id, ...rest } = payload
    if (id) {
      const { data, error } = await supabase.from("posts").update(rest).eq("id", id).select().single()
      if (error) throw error
      return data
    }
    const { data, error } = await supabase.from("posts").insert(rest).select().single()
    if (error) throw error
    return data
  },
  async remove(id) {
    if (DEMO) throw demoError()
    const { error } = await supabase.from("posts").delete().eq("id", id)
    if (error) throw error
  },
}

// ---------- Bilingual post pairing -----------------------------------
function pairingRpcError(error) {
  const missing = error?.code === "PGRST202" || /could not find the function|schema cache/i.test(error?.message || "")
  if (missing) {
    return new Error(
      "Blog pairing migration belum aktif. Jalankan supabase/migrations/20260723_blog_pairing.sql di Supabase SQL Editor, lalu refresh dashboard."
    )
  }
  return error
}

export async function pairPosts(firstPostId, secondPostId) {
  if (DEMO) throw demoError()
  const { data, error } = await supabase.rpc("pair_posts", {
    first_post_id: firstPostId,
    second_post_id: secondPostId,
  })
  if (error) throw pairingRpcError(error)
  return data
}

export async function unpairPost(postId) {
  if (DEMO) throw demoError()
  const { data, error } = await supabase.rpc("unpair_post", { post_id: postId })
  if (error) throw pairingRpcError(error)
  return data
}

// ---------- Image upload ---------------------------------------------
export async function uploadImage(file) {
  if (DEMO) throw demoError()
  const ext = file.name.split(".").pop()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

// ---------- Auth ------------------------------------------------------
export const auth = {
  async getSession() {
    if (DEMO) return null
    const { data } = await supabase.auth.getSession()
    return data.session
  },
  onChange(cb) {
    if (DEMO) return () => {}
    const { data } = supabase.auth.onAuthStateChange((_e, session) => cb(session))
    return () => data.subscription.unsubscribe()
  },
  async signIn(email, password) {
    if (DEMO) throw demoError()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data.session
  },
  async signOut() {
    if (DEMO) return
    await supabase.auth.signOut()
  },
}
