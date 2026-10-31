-- Encrypted AI provider settings. Run through Supabase migrations or re-run
-- schema.sql, then configure the server-only service role and encryption keys.
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

alter table public.ai_settings enable row level security;
revoke all on table public.ai_settings from anon, authenticated;
