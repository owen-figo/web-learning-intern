-- Ngerti database schema for Supabase.
-- Run once in the Supabase dashboard → SQL Editor → New query → paste → Run.
-- Then run, in order: students.sql, profile-sync.sql.

-- One row per student, created automatically when they sign up (trigger below).
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Pelajar',
  xp integer not null default 0 check (xp >= 0),
  weekly_xp integer not null default 0 check (weekly_xp >= 0),
  streak_days integer not null default 0 check (streak_days >= 0),
  last_active_date date,
  created_at timestamptz not null default now()
);

-- Finished theory topics ("Selesai Belajar").
create table if not exists public.topic_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  topic_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

-- Latihan Mandiri answers (question ids like 'T3-L04').
create table if not exists public.practice_answers (
  user_id uuid not null references public.profiles (id) on delete cascade,
  question_id text not null,
  selected smallint not null check (selected between 0 and 3),
  correct boolean not null,
  answered_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index if not exists profiles_weekly_xp_idx on public.profiles (weekly_xp desc);
create index if not exists profiles_xp_idx on public.profiles (xp desc);

-- Row Level Security: a signed-in student can read only their own rows. All writes go through the
-- Next.js backend, which uses the service role key (that key bypasses these policies).
alter table public.profiles enable row level security;
alter table public.topic_progress enable row level security;
alter table public.practice_answers enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "read own topic progress" on public.topic_progress;
create policy "read own topic progress" on public.topic_progress for select using (auth.uid() = user_id);

drop policy if exists "read own practice answers" on public.practice_answers;
create policy "read own practice answers" on public.practice_answers for select using (auth.uid() = user_id);

-- Create a profile when a new user signs up. The name comes from sign-up metadata, or the email.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Add XP atomically (no read-then-write race). Only the backend (service role) may call it.
create or replace function public.add_xp(p_user uuid, p_amount integer)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles
  set xp = xp + p_amount,
      weekly_xp = weekly_xp + p_amount
  where id = p_user;
$$;

revoke execute on function public.add_xp(uuid, integer) from public, anon, authenticated;
