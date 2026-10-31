import { createClient } from "@supabase/supabase-js"

// Next.js exposes browser-safe env vars via the NEXT_PUBLIC_ prefix. Leave these
// blank to run the whole app in demo mode (bundled seed content, no network).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null

export const MEDIA_BUCKET = "media"
