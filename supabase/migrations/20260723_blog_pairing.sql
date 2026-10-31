-- Blog bilingual pairing migration
-- Run this entire file once in Supabase Dashboard -> SQL Editor.

create extension if not exists pgcrypto;

alter table public.posts
  add column if not exists translation_key uuid default gen_random_uuid();
update public.posts
  set translation_key = gen_random_uuid()
  where translation_key is null;
alter table public.posts
  alter column translation_key set default gen_random_uuid();
alter table public.posts
  alter column translation_key set not null;
create unique index if not exists posts_translation_pair_key
  on public.posts (translation_key, locale);

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

  select locale into first_locale
  from public.posts
  where id = first_post_id;

  select locale into second_locale
  from public.posts
  where id = second_post_id;

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

  update public.posts
  set translation_key = next_key
  where id = post_id;

  if not found then
    raise exception 'Post not found';
  end if;

  return next_key;
end;
$$;

revoke all on function public.pair_posts(uuid, uuid) from public;
revoke all on function public.unpair_post(uuid) from public;
grant execute on function public.pair_posts(uuid, uuid) to authenticated;
grant execute on function public.unpair_post(uuid) to authenticated;

-- Ask PostgREST to discover the new RPC functions immediately.
notify pgrst, 'reload schema';
