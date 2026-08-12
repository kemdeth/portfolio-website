-- Contact form messages received via netlify/functions/contact.ts
-- Run this in the Supabase SQL editor (Dashboard -> SQL -> New query).
--
-- The Netlify function writes with the service_role key, which bypasses RLS.
-- No policies are created, so the anon and authenticated roles have zero access
-- (nobody can read or spam this table directly from the browser).

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;
