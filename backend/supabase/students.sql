-- Registered students (the account list). Run once in Supabase → SQL Editor, after schema.sql.
-- Fill it with:  npm run import:students -- path/to/students.csv   (run inside backend/)
--
-- Students log in with their email + NIM. The first time, the backend checks them against this table
-- and creates their Supabase Auth account (password = NIM); `user_id` links the two.
  create table if not exists public.students (
    email text primary key check (email = lower(email)),
    nim text not null check (length(nim) >= 6),
    name text not null,
    user_id uuid unique references auth.users (id) on delete set null,
    created_at timestamptz not null default now()
  );

  -- No policies: nobody can read this table with the publishable key. Only the backend (service role) can.
  alter table public.students enable row level security;
