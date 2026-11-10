-- Leaderboard tie-break. Run once in Supabase → SQL Editor, after profile-sync.sql.
-- Students with the same XP are ranked by who reached that XP first: every XP gain stamps
-- profiles.xp_reached_at, and the leaderboard sorts by xp desc, then xp_reached_at asc.

alter table public.profiles
  add column if not exists xp_reached_at timestamptz;

-- Existing students: their last XP gain was their latest correct answer or finished topic.
update public.profiles p
set xp_reached_at = greatest(
  (select max(a.answered_at) from public.practice_answers a where a.user_id = p.id and a.correct),
  (select max(t.completed_at) from public.topic_progress t where t.user_id = p.id)
)
where p.xp > 0 and p.xp_reached_at is null;

create index if not exists profiles_xp_rank_idx on public.profiles (xp desc, xp_reached_at asc);

-- Same as profile-sync.sql, plus the xp_reached_at stamp.
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
      xp_reached_at = case when p_amount > 0 then now() else p.xp_reached_at end,
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
