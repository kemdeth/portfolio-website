-- ================================================================
-- Portfolio Site Data – Full Supabase Schema
-- ================================================================
-- Run this entire file in the Supabase SQL editor
-- (Dashboard → SQL → New query) to create all required tables.
--
-- The Netlify admin function writes with the service_role key,
-- which bypasses RLS. No policies are created, so the anon and
-- authenticated roles have zero write access by default.
--
-- If you want the PUBLIC site to read directly from Supabase
-- (for multi-device sync), add the SELECT policies below each table.
-- ================================================================

-- 1. Contact-form messages (already existed) -----------------------

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

-- 2. Site profile (singleton – always id = 1) ----------------------

create table if not exists public.site_profile (
  id integer primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint site_profile_singleton check (id = 1)
);

insert into public.site_profile (id, data) values (1, '{}'::jsonb)
on conflict (id) do nothing;

alter table public.site_profile enable row level security;

-- 3. Skills ---------------------------------------------------------

create table if not exists public.skills (
  id text primary key,
  category text not null,
  name text not null,
  level integer not null default 70,
  icon text,
  color text,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.skills enable row level security;

-- 4. Projects -------------------------------------------------------

create table if not exists public.projects (
  id text primary key,
  title text not null,
  description text not null default '',
  challenge text,
  tags text[] not null default '{}',
  image text not null default '',
  live_url text,
  source_url text,
  featured boolean not null default false,
  status text,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

-- 5. Certificates ---------------------------------------------------

create table if not exists public.certificates (
  id text primary key,
  name text not null,
  issuer text not null default '',
  year text,
  url text,
  image text,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.certificates enable row level security;

-- 6. Testimonials ---------------------------------------------------

create table if not exists public.testimonials (
  id text primary key,
  name text not null,
  role text not null default '',
  quote text not null default '',
  avatar text not null default '',
  rating integer not null default 5,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

-- ================================================================
-- OPTIONAL: Allow the public site to read data directly via the
-- anon key. Uncomment these policies if VITE_SUPABASE_URL and
-- VITE_SUPABASE_ANON_KEY are configured in the build environment.
-- ================================================================

-- create policy "Public read" on public.site_profile for select using (true);
-- create policy "Public read" on public.skills        for select using (true);
-- create policy "Public read" on public.projects      for select using (true);
-- create policy "Public read" on public.certificates  for select using (true);
-- create policy "Public read" on public.testimonials  for select using (true);
-- create policy "Public read" on public.messages      for select using (true);
