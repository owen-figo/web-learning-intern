-- Profile sync. Run once in Supabase → SQL Editor, after schema.sql and students.sql.
-- No new table: the profile page's own settings become columns on `profiles`, and add_xp also keeps
-- the daily streak.

alter table public.profiles
  add column if not exists initials text check (initials ~ '^[A-Z0-9]{1,2}$'),
  add column if not exists avatar_color text not null default '#0e7c63' check (avatar_color ~ '^#[0-9a-f]{6}$'),
  add column if not exists email_digest boolean not null default true,
  add column if not exists whatsapp_ping boolean not null default true,
  add column if not exists best_streak integer not null default 0 check (best_streak >= 0);

-- Add XP and count the day as active (Jakarta time). Studying on consecutive days grows the streak;
-- missing a day starts it again at 1. Only the backend (service role) may call it.
create or replace function public.add_xp(p_user uuid, p_amount integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  today date := (now() at time zone 'Asia/Jakarta')::date;
begin
  update public.profiles p
  set xp = p.xp + p_amount,
      weekly_xp = p.weekly_xp + p_amount,
      streak_days = s.next_streak,
      best_streak = greatest(p.best_streak, s.next_streak),
      last_active_date = today
  from (
    select case
      when last_active_date = today then streak_days
      when last_active_date = today - 1 then streak_days + 1
      else 1
    end as next_streak
    from public.profiles
    where id = p_user
  ) s
  where p.id = p_user;
end;
$$;

revoke execute on function public.add_xp(uuid, integer) from public, anon, authenticated;
