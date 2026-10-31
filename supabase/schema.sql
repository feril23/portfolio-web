-- =====================================================================
--  Portfolio CMS schema for Supabase (PostgreSQL)
--  Run this in the Supabase SQL editor (Dashboard -> SQL -> New query).
--  It creates the tables, storage bucket, and row-level-security rules.
--
--  LOCALIZATION: every content table carries a `locale` column ('id' | 'en'),
--  so each language has its own set of rows and can be edited independently
--  from the dashboard. Interface copy (nav, buttons, SEO, …) lives in the
--  `translations` table as JSON, one row per locale.
--
--  This script is safe to re-run and also upgrades an older (single-language)
--  database by adding the missing `locale` columns.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Profile (one row per locale) -----------------------------
create table if not exists public.profile (
  id            uuid primary key default gen_random_uuid(),
  locale        text not null default 'id',
  name          text not null default '',
  initials      text default '',
  role          text default '',
  roles         text[] default '{}',
  headline      text default '',
  statement     text default '',
  paragraphs    text[] default '{}',
  keywords      text[] default '{}',
  location      text default '',
  availability  text default '',
  email         text default '',
  updated_at    timestamptz default now()
);

-- ---------- Social links ---------------------------------------------
create table if not exists public.socials (
  id     uuid primary key default gen_random_uuid(),
  locale text not null default 'id',
  label  text not null,
  href   text not null default '#',
  sort   int  default 0
);

-- ---------- Skill groups ---------------------------------------------
create table if not exists public.skills (
  id       uuid primary key default gen_random_uuid(),
  locale   text not null default 'id',
  "group"  text not null,
  items    text[] default '{}',
  sort     int default 0
);

-- ---------- Services / capability ledger -----------------------------
create table if not exists public.services (
  id               uuid primary key default gen_random_uuid(),
  locale           text not null default 'id',
  translation_key  uuid not null default gen_random_uuid(),
  title            text not null default '',
  description      text default '',
  deliverables     text[] default '{}',
  sort             int default 0,
  published        boolean not null default true,
  created_at       timestamptz default now()
);

-- ---------- Projects / work ------------------------------------------
create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  locale       text not null default 'id',
  title        text not null default '',
  description  text default '',
  tags         text[] default '{}',
  year         text default '',
  href         text default '#',
  image_url    text,
  sort         int default 0,
  created_at   timestamptz default now()
);

-- ---------- Experience -----------------------------------------------
create table if not exists public.experience (
  id           uuid primary key default gen_random_uuid(),
  locale       text not null default 'id',
  role         text not null default '',
  company      text default '',
  period       text default '',
  description  text default '',
  sort         int default 0
);

-- ---------- Blog posts (per locale) ----------------------------------
create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  locale        text not null default 'id',
  title         text not null default '',
  slug          text not null,
  excerpt       text default '',
  content       text default '',
  cover_url     text,
  published     boolean default false,
  published_at  timestamptz,
  created_at    timestamptz default now()
);

-- ---------- Interface copy / UI strings (one JSON row per locale) -----
create table if not exists public.translations (
  locale     text primary key,
  data       jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- ---------- AI change plans / audit trail -----------------------------
create table if not exists public.ai_runs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid(),
  locale      text not null default 'id',
  prompt      text not null,
  summary     text default '',
  operations      jsonb not null default '[]',
  warnings        jsonb not null default '[]',
  scope           jsonb not null default '{}',
  result          jsonb,
  rollback_result jsonb,
  model           text default '',
  status          text not null default 'planned' check (status in ('planned','applied','failed','rolled_back')),
  created_at      timestamptz default now(),
  applied_at      timestamptz,
  rolled_back_at  timestamptz
);

-- Upgrade existing AI audit tables safely when this schema is re-run.
alter table public.ai_runs add column if not exists scope jsonb not null default '{}';
alter table public.ai_runs add column if not exists rollback_result jsonb;
alter table public.ai_runs add column if not exists rolled_back_at timestamptz;
alter table public.ai_runs drop constraint if exists ai_runs_status_check;
alter table public.ai_runs add constraint ai_runs_status_check
  check (status in ('planned','applied','failed','rolled_back'));
create index if not exists ai_runs_user_created_idx on public.ai_runs (user_id, created_at desc);

-- ---------- Encrypted, server-only AI provider settings ---------------
-- The ciphertext can only be accessed with the service-role key. The AES-GCM
-- master key remains in AI_SETTINGS_ENCRYPTION_KEY on the application server.
create table if not exists public.ai_settings (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  provider             text not null check (provider in ('openrouter','openai','groq','together')),
  model                text not null,
  temperature          numeric not null default 0.2 check (temperature >= 0 and temperature <= 2),
  max_tokens           integer not null default 6000 check (max_tokens >= 256 and max_tokens <= 16000),
  api_key_encrypted    text not null,
  api_key_hint         text not null default '',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- =====================================================================
--  Upgrade path: add locale columns to databases created before i18n.
-- =====================================================================
do $$
declare t text;
begin
  foreach t in array array['profile','socials','skills','services','projects','experience','posts']
  loop
    execute format('alter table public.%I add column if not exists locale text not null default ''id'';', t);
  end loop;
end $$;

-- Stable translation pairing. A translated row receives the same key as its
-- source, while keeping a different primary id and locale.
do $$
declare t text;
begin
  foreach t in array array['socials','skills','services','projects','experience','posts']
  loop
    execute format('alter table public.%I add column if not exists translation_key uuid default gen_random_uuid();', t);
    execute format('update public.%I set translation_key = gen_random_uuid() where translation_key is null;', t);
    execute format('alter table public.%I alter column translation_key set default gen_random_uuid();', t);
    execute format('alter table public.%I alter column translation_key set not null;', t);
    execute format('create unique index if not exists %I on public.%I (translation_key, locale);', t || '_translation_pair_key', t);
  end loop;
end $$;

-- Posts slugs are unique per language (so /id/blog/x and /en/blog/x can pair).
alter table public.posts drop constraint if exists posts_slug_key;
create unique index if not exists posts_locale_slug_key on public.posts (locale, slug);

-- Helpful lookup indexes.
create index if not exists profile_locale_idx    on public.profile (locale);
create index if not exists socials_locale_idx    on public.socials (locale);
create index if not exists skills_locale_idx     on public.skills (locale);
create index if not exists services_locale_idx   on public.services (locale);
create index if not exists projects_locale_idx   on public.projects (locale);
create index if not exists experience_locale_idx on public.experience (locale);
create index if not exists posts_locale_idx       on public.posts (locale);

-- =====================================================================
--  Storage bucket for image uploads (project covers, blog covers)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- =====================================================================
--  Row Level Security
--  Public (anon) can READ everything so the site can render.
--  Only AUTHENTICATED users (you, signed into the dashboard) can write.
-- =====================================================================
alter table public.profile      enable row level security;
alter table public.socials      enable row level security;
alter table public.skills       enable row level security;
alter table public.services     enable row level security;
alter table public.projects     enable row level security;
alter table public.experience   enable row level security;
alter table public.posts        enable row level security;
alter table public.translations enable row level security;

do $$
declare t text;
begin
  foreach t in array array['profile','socials','skills','projects','experience','posts','translations']
  loop
    execute format('drop policy if exists "public read %1$s" on public.%1$s;', t);
    execute format('drop policy if exists "auth write %1$s" on public.%1$s;', t);
    -- Anyone can read
    execute format('create policy "public read %1$s" on public.%1$s for select using (true);', t);
    -- Signed-in users can insert/update/delete
    execute format('create policy "auth write %1$s" on public.%1$s for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;

-- Hidden services remain private to the dashboard. Anonymous visitors can
-- query only published rows, while authenticated admins retain full access.
drop policy if exists "public read services" on public.services;
drop policy if exists "auth write services" on public.services;
create policy "public read services" on public.services
  for select to anon using (published = true);
create policy "auth write services" on public.services
  for all to authenticated using (true) with check (true);

-- AI plans are private to the authenticated admin who created them.
alter table public.ai_runs enable row level security;
drop policy if exists "ai runs own select" on public.ai_runs;
drop policy if exists "ai runs own insert" on public.ai_runs;
drop policy if exists "ai runs own update" on public.ai_runs;
create policy "ai runs own select" on public.ai_runs
  for select to authenticated using (auth.uid() = user_id);
create policy "ai runs own insert" on public.ai_runs
  for insert to authenticated with check (auth.uid() = user_id);
create policy "ai runs own update" on public.ai_runs
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- No browser role receives access to encrypted provider credentials. The
-- authenticated dashboard talks to the server API, which uses service_role.
alter table public.ai_settings enable row level security;
revoke all on table public.ai_settings from anon, authenticated;

-- Atomic helpers for manually connecting bilingual blog posts in the admin.
create or replace function public.pair_posts(first_post_id uuid, second_post_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  first_locale text;
  second_locale text;
  pair_key uuid := gen_random_uuid();
begin
  if auth.role() <> 'authenticated' then
    raise exception 'Authentication required';
  end if;
  select locale into first_locale from public.posts where id = first_post_id;
  select locale into second_locale from public.posts where id = second_post_id;
  if first_locale is null or second_locale is null then
    raise exception 'Post not found';
  end if;
  if first_locale = second_locale then
    raise exception 'Paired posts must use different languages';
  end if;
  update public.posts
    set translation_key = pair_key
    where id in (first_post_id, second_post_id);
  return pair_key;
end;
$$;

create or replace function public.unpair_post(post_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  next_key uuid := gen_random_uuid();
begin
  if auth.role() <> 'authenticated' then
    raise exception 'Authentication required';
  end if;
  update public.posts set translation_key = next_key where id = post_id;
  if not found then raise exception 'Post not found'; end if;
  return next_key;
end;
$$;

revoke all on function public.pair_posts(uuid, uuid) from public;
revoke all on function public.unpair_post(uuid) from public;
grant execute on function public.pair_posts(uuid, uuid) to authenticated;
grant execute on function public.unpair_post(uuid) to authenticated;

-- Refresh the PostgREST schema cache so the RPC functions are immediately visible.
notify pgrst, 'reload schema';

-- Storage policies: public read, authenticated write
drop policy if exists "media public read" on storage.objects;
drop policy if exists "media auth write" on storage.objects;
create policy "media public read" on storage.objects
  for select using (bucket_id = 'media');
create policy "media auth write" on storage.objects
  for all to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');

-- =====================================================================
--  Optional: seed one empty profile row per locale so the dashboard has
--  something to edit immediately in both languages.
-- =====================================================================
insert into public.profile (name, locale)
select 'Your Name', 'id'
where not exists (select 1 from public.profile where locale = 'id');

insert into public.profile (name, locale)
select 'Your Name', 'en'
where not exists (select 1 from public.profile where locale = 'en');
