-- Bilingual certifications managed from /admin/certifications and rendered as
-- the public Certifications section.
create extension if not exists pgcrypto;

create table if not exists public.certifications (
  id               uuid primary key default gen_random_uuid(),
  locale           text not null default 'id',
  translation_key  uuid not null default gen_random_uuid(),
  title            text not null default '',
  issuer           text default '',
  description      text default '',
  issued_at        date,
  expires_at       date,
  credential_id    text default '',
  credential_url   text default '',
  image_url        text,
  featured         boolean not null default false,
  sort             int default 0,
  published        boolean not null default true,
  created_at       timestamptz default now()
);

create unique index if not exists certifications_translation_pair_key
  on public.certifications (translation_key, locale);
create index if not exists certifications_locale_idx on public.certifications (locale);

alter table public.certifications enable row level security;
drop policy if exists "public read certifications" on public.certifications;
drop policy if exists "auth write certifications" on public.certifications;
create policy "public read certifications" on public.certifications for select to anon using (published = true);
create policy "auth write certifications" on public.certifications for all to authenticated using (true) with check (true);

notify pgrst, 'reload schema';
