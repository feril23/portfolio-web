-- Bilingual services managed from /admin/services and rendered as the public
-- capability ledger.
create extension if not exists pgcrypto;

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

create unique index if not exists services_translation_pair_key
  on public.services (translation_key, locale);
create index if not exists services_locale_idx on public.services (locale);

-- Initial editable content so the section is visible immediately. The stable
-- translation keys pair each Indonesian row with its English counterpart.
insert into public.services (locale, translation_key, title, description, deliverables, sort, published)
values
  ('id', '00000000-0000-4000-8000-000000000001', 'Strategi Produk & UX', 'Mengubah ide awal dan kebutuhan yang kompleks menjadi arah produk yang fokus, alur yang jelas, dan prototipe yang dapat diuji.', array['Discovery','Audit UX','User Flow','Prototipe'], 0, true),
  ('en', '00000000-0000-4000-8000-000000000001', 'Product Strategy & UX', 'Turning early ideas and complex requirements into focused product directions, clear flows, and testable prototypes.', array['Discovery','UX Audit','User Flows','Prototyping'], 0, true),
  ('id', '00000000-0000-4000-8000-000000000002', 'Interface & Design System', 'Merancang antarmuka yang koheren serta fondasi reusable agar produk tetap konsisten ketika berkembang.', array['Desain UI','Komponen','Design Token','Dokumentasi'], 1, true),
  ('en', '00000000-0000-4000-8000-000000000002', 'Interface & Design Systems', 'Designing coherent interfaces and reusable foundations that keep products consistent as they grow.', array['UI Design','Components','Design Tokens','Documentation'], 1, true),
  ('id', '00000000-0000-4000-8000-000000000003', 'Frontend Development', 'Membangun antarmuka responsif dan aksesibel dengan kode siap produksi serta perhatian pada performa.', array['React','Next.js','UI Responsif','Arsitektur CSS'], 2, true),
  ('en', '00000000-0000-4000-8000-000000000003', 'Frontend Development', 'Building responsive, accessible interfaces with production-ready code and careful attention to performance.', array['React','Next.js','Responsive UI','CSS Architecture'], 2, true),
  ('id', '00000000-0000-4000-8000-000000000004', 'Motion & Interaction', 'Menggunakan motion yang terarah dan detail interaksi untuk memandu perhatian serta memberi rasa matang pada produk digital.', array['Motion Direction','Prototipe','GSAP','Micro-interaction'], 3, true),
  ('en', '00000000-0000-4000-8000-000000000004', 'Motion & Interaction', 'Using purposeful motion and interaction details to guide attention and make digital products feel considered.', array['Motion Direction','Prototyping','GSAP','Micro-interactions'], 3, true)
on conflict (translation_key, locale) do nothing;

alter table public.services enable row level security;
drop policy if exists "public read services" on public.services;
drop policy if exists "auth write services" on public.services;
create policy "public read services" on public.services for select to anon using (published = true);
create policy "auth write services" on public.services for all to authenticated using (true) with check (true);
