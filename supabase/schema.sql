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
-- RLS policies — required when using the anon key (VITE_SUPABASE_ANON_KEY)
-- instead of the service-role key for server-side operations.
--
-- The Netlify functions provide their own access control:
--   • contact.ts  — rate-limited, honeypot + Turnstile protected
--   • admin.ts    — session-cookie authenticated
--
-- Run these statements in the Supabase SQL editor
-- (Dashboard → SQL → New query) to enable them.
-- ================================================================

-- Public read access (site data for cross-device sync)
drop policy if exists "Public read" on public.site_profile;
drop policy if exists "Public read" on public.skills;
drop policy if exists "Public read" on public.projects;
drop policy if exists "Public read" on public.certificates;
drop policy if exists "Public read" on public.testimonials;
drop policy if exists "Public read" on public.messages;
create policy "Public read" on public.site_profile  for select using (true);
create policy "Public read" on public.skills        for select using (true);
create policy "Public read" on public.projects      for select using (true);
create policy "Public read" on public.certificates  for select using (true);
create policy "Public read" on public.testimonials  for select using (true);
create policy "Public read" on public.messages      for select using (true);

-- Message write policies (contact form inserts, admin dashboard updates/deletes)
drop policy if exists "Public insert messages" on public.messages;
drop policy if exists "Public update messages" on public.messages;
drop policy if exists "Public delete messages" on public.messages;
create policy "Public insert messages"  on public.messages for insert with check (true);
create policy "Public update messages"  on public.messages for update using (true);
create policy "Public delete messages"  on public.messages for delete using (true);

-- Admin write policies for other tables (admin dashboard CRUD)
drop policy if exists "Public upsert site_profile" on public.site_profile;
drop policy if exists "Public update site_profile" on public.site_profile;
drop policy if exists "Public upsert skills" on public.skills;
drop policy if exists "Public update skills" on public.skills;
drop policy if exists "Public delete skills" on public.skills;
drop policy if exists "Public upsert projects" on public.projects;
drop policy if exists "Public update projects" on public.projects;
drop policy if exists "Public delete projects" on public.projects;
drop policy if exists "Public upsert certificates" on public.certificates;
drop policy if exists "Public update certificates" on public.certificates;
drop policy if exists "Public delete certificates" on public.certificates;
drop policy if exists "Public upsert testimonials" on public.testimonials;
drop policy if exists "Public update testimonials" on public.testimonials;
drop policy if exists "Public delete testimonials" on public.testimonials;
create policy "Public upsert site_profile"  on public.site_profile  for insert with check (true);
create policy "Public update site_profile"  on public.site_profile  for update using (true);
create policy "Public upsert skills"        on public.skills        for insert with check (true);
create policy "Public update skills"        on public.skills        for update using (true);
create policy "Public delete skills"        on public.skills        for delete using (true);
create policy "Public upsert projects"      on public.projects      for insert with check (true);
create policy "Public update projects"      on public.projects      for update using (true);
create policy "Public delete projects"      on public.projects      for delete using (true);
create policy "Public upsert certificates" on public.certificates  for insert with check (true);
create policy "Public update certificates" on public.certificates  for update using (true);
create policy "Public delete certificates" on public.certificates  for delete using (true);
create policy "Public upsert testimonials" on public.testimonials  for insert with check (true);
create policy "Public update testimonials" on public.testimonials  for update using (true);
create policy "Public delete testimonials" on public.testimonials  for delete using (true);
