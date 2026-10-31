# Feril Ferdian — Portfolio (Next.js)

Award-style personal portfolio + journal with a Supabase-backed CMS dashboard.
Built with the **Next.js App Router** (server-rendered for SEO), a **GSAP**
page-transition editorial fold, smooth scrolling (Lenis), and a light/dark theme.

## Requirements

- Node.js 18.18+ (Node 20+ recommended)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) Configure Supabase for live content + the dashboard:
   ```bash
   cp .env.example .env.local
   # then fill in:
   #   NEXT_PUBLIC_SUPABASE_URL
   #   NEXT_PUBLIC_SUPABASE_ANON_KEY
   # and run supabase/schema.sql in your Supabase project.
   ```
   Without these, the app runs in **demo mode** using the bundled seed content
   in `src/data.js` (no network required).
3. Start the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Production build             |
| `npm run start` | Run the production build     |

## Routes

| Path           | Rendering   | Description                               |
| -------------- | ----------- | ----------------------------------------- |
| `/`            | SSR         | Home                                      |
| `/blog`        | SSR         | Journal index                             |
| `/blog/[slug]` | SSR         | Post (per-post `<title>`/description)     |
| `/admin`       | Client-only | CMS dashboard (BlockNote + Supabase auth) |
| `/admin/services` | Client-only | Capability and service management      |

## CSS architecture

Public styles are intentionally split by responsibility:

| File                     | Responsibility                                           |
| ------------------------ | -------------------------------------------------------- |
| `src/styles/base.css`    | Tokens, reset, shared layout, typography                 |
| `src/styles/chrome.css`  | Navigation, language/theme controls, mobile menu, footer |
| `src/styles/home.css`    | Home, services, work, experience, and contact sections   |
| `src/styles/journal.css` | Journal index, article layout, and prose                 |
| `src/styles/motion.css`  | Reveal helpers, Lenis, reduced motion, and route curtain |
| `src/admin/admin.css`    | Admin dashboard only                                     |

## Architecture notes

- **SEO:** the public site & blog are server-rendered via App Router route
  loaders, so crawlers get fully-populated HTML.
- **Transitions:** navigation stays client-side, so the GSAP editorial fold plays
  between routes. See `src/lib/Curtain.jsx` and `src/lib/router.jsx`.
- **Dashboard:** loaded with `next/dynamic({ ssr: false })` because it depends
  on the browser (BlockNote editor, Supabase auth).
- **Motion:** GSAP / ScrollTrigger / Lenis / SplitType are imported dynamically
  inside effects so they never run during SSR (`src/useAnimations.js`).

## Localization (i18n)

The site ships in **Bahasa Indonesia** (default) and **English**, using locale-prefixed URLs for the best SEO:

- `/id`, `/id/blog`, `/id/blog/:slug` — Bahasa Indonesia (default)
- `/en`, `/en/blog`, `/en/blog/:slug` — English
- The bare `/` redirects to `/id`.

Each page emits `hreflang` alternates and a canonical URL so search engines index both languages correctly. Set `NEXT_PUBLIC_SITE_URL` in your `.env` so those links are absolute in production.

### Everything is editable from the dashboard, per language

When Supabase is connected, **all** translatable content is stored and edited per locale — no code editing required:

- **Portfolio content** (profile, headline, about, skills, services, projects, experience) and **blog posts** each have their own rows per language. Every content table has a `locale` column (`id` / `en`).
- **Interface copy** (nav, buttons, section labels, blog UI, SEO titles/descriptions, etc.) is stored per locale in the `translations` table as JSON.

In the dashboard, use the **Editing language** switcher in the sidebar to choose which language you're editing. Every editor (Overview, Services, Work, Experience, Blog, Profile) loads and saves rows for that language. The **Interface** page lets you edit all UI strings, including the public Services section naming, for the selected language.

### Defaults & fallbacks

- `src/i18n/ui.js` holds the **built-in default** interface copy. Anything you leave blank in the Interface editor falls back to these defaults.
- `src/data.js` holds the bundled **demo content** (used only when Supabase is not configured), fully translated in both languages.
- Locale config: `src/i18n/config.js`. Add a locale by extending `locales`, adding a matching block in `ui.js`, and creating rows for it in the dashboard.

### Upgrading an existing database

If you set up the database before this update, re-run `supabase/schema.sql` in the Supabase SQL editor. It is safe to re-run: it adds the `locale` columns (existing rows default to `id`), switches blog slug uniqueness to per-locale, and creates the `translations` table. After that, switch the dashboard to **EN** and fill in the English versions of your content.

For the editable Capability Ledger, run `supabase/migrations/20260726_services.sql`. It creates the bilingual `services` table and inserts four editable starter services in Indonesian and English.

## Admin AI Assistant (OpenRouter)

The dashboard includes an approval-based AI content operator at `/admin/ai`. It can read and propose changes for profile, services, projects, experience, posts, skills, social links, and interface translations. No write is performed until **Confirm and apply** is selected.

### Setup

1. Re-run `supabase/schema.sql` in the Supabase SQL editor. This adds the private `ai_runs` audit table and its row-level-security policies.
2. Add these server environment variables locally and in your deployment:

```bash
# Required for secure dashboard-managed AI credentials
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
AI_SETTINGS_ENCRYPTION_KEY=32_byte_base64_key

# Optional fallback if no dashboard override exists
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=openai/gpt-4.1-mini
```

Generate the encryption key once with `openssl rand -base64 32`. Keep it stable; rotating it without re-encrypting stored credentials makes existing API keys unreadable.

3. Keep `SUPABASE_SERVICE_ROLE_KEY`, `AI_SETTINGS_ENCRYPTION_KEY`, and provider API keys server-only. Never prefix them with `NEXT_PUBLIC_`.
4. Sign into `/admin`, open **AI Assistant**, configure OpenRouter, OpenAI, Groq, or Together AI in **Model connection**, and test the saved connection.
5. Generate a plan, inspect every operation, then confirm it.

Dashboard-managed API keys are encrypted with AES-256-GCM. The browser only receives the provider, model, operational parameters, and last four key characters. The `ai_settings` table has no anon/authenticated grants or RLS policies and is accessed only by the server with the service role. Removing the dashboard override restores the optional OpenRouter environment fallback.

The AI endpoint verifies the Supabase admin session, only accepts whitelisted resources and fields, limits each plan to 30 operations, stores the approved plan server-side, and applies that stored plan after confirmation.

### Personal AI workflow features

The expanded assistant supports:

- **Scoped context:** choose which dashboard resources, including Services, AI may read.
- **Language scope:** work only in the active locale or across Indonesian and English.
- **Selective approval:** apply individual operations instead of accepting the whole plan.
- **Plan refinement:** give follow-up feedback and regenerate a safer plan before applying it.
- **Saved prompts:** keep up to eight reusable personal instructions in the browser.
- **Activity history:** inspect the latest 30 plans, statuses, models, and operation counts.
- **Rollback:** restore previous rows and remove AI-created rows for an applied run.
- **Keyboard workflow:** press Cmd/Ctrl + Enter to generate a plan.

Rollback snapshots are private and protected by Supabase row-level security. Re-run `supabase/schema.sql` after upgrading so the `scope`, `rollback_result`, `rolled_back_at`, and `rolled_back` status fields are available.

### Additive translation safety

Translation runs are additive. Existing source-language rows never change locale and are never reused as target-language rows. Missing translations are created with a new primary id and share a private `translation_key` with the source row. Existing rows are updated without a `locale` field in the update payload, cross-locale deletes are blocked, and translation prompts automatically load both language datasets.
