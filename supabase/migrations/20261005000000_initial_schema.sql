-- ════════════════════════════════════════════════════════════════════════════
--  THE CHEMICAL ARCHIVE — initial schema
--  Run once in the Supabase SQL editor (or with `supabase db push`).
--
--  Hierarchy
--    academic_sections ─┐
--                       ├─► chapters ─► resources
--    subjects ──────────┘          └──► pyqs ◄─► resources (pyq_resources)
--
--  Security model
--    • Everyone (anon + authenticated) may READ published content.
--    • Only users listed in public.admins may INSERT / UPDATE / DELETE.
--    • Enforced with Row Level Security — never by the UI alone.
-- ════════════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ─── Enums ──────────────────────────────────────────────────────────────────
do $$ begin
  create type public.resource_category as enum ('lecture', 'pyq', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.resource_type as enum
    ('ppt', 'pdf', 'notes', 'pyq', 'question_paper', 'study_material', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.difficulty_level as enum ('easy', 'medium', 'hard');
exception when duplicate_object then null; end $$;

-- ─── Helpers ────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ─── Profiles (future: accounts, synced progress, streaks) ──────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text,
  display_name text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Admins ─────────────────────────────────────────────────────────────────
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER so policies can consult admins without recursive RLS.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ─── Academic sections ──────────────────────────────────────────────────────
create table if not exists public.academic_sections (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name          text not null,
  description   text,
  display_order integer not null default 0,
  is_enabled    boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── Subjects ───────────────────────────────────────────────────────────────
create table if not exists public.subjects (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name          text not null,
  description   text,
  display_order integer not null default 0,
  is_enabled    boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── Chapters / topics ──────────────────────────────────────────────────────
create table if not exists public.chapters (
  id            uuid primary key default gen_random_uuid(),
  section_id    uuid not null references public.academic_sections (id) on delete cascade,
  subject_id    uuid not null references public.subjects (id) on delete cascade,
  name          text not null,
  description   text,
  display_order integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists chapters_section_subject_idx on public.chapters (section_id, subject_id, display_order);

-- ─── Resources (Google Drive links — files are never hosted here) ───────────
create table if not exists public.resources (
  id            uuid primary key default gen_random_uuid(),
  section_id    uuid not null references public.academic_sections (id) on delete cascade,
  subject_id    uuid not null references public.subjects (id) on delete cascade,
  chapter_id    uuid references public.chapters (id) on delete set null,
  category      public.resource_category not null default 'lecture',
  resource_type public.resource_type not null default 'pdf',
  title         text not null,
  label         text,                      -- e.g. "Lecture 04", "May 2024"
  description   text,
  drive_url     text not null check (drive_url ~* '^https://'),
  image_url     text check (image_url is null or image_url ~* '^https://'),
  display_order integer not null default 0,
  is_trackable  boolean not null default true,  -- shows a "completed" checkbox
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists resources_section_subject_idx on public.resources (section_id, subject_id, category, display_order);
create index if not exists resources_chapter_idx on public.resources (chapter_id);

-- ─── PYQs ───────────────────────────────────────────────────────────────────
create table if not exists public.pyqs (
  id                 uuid primary key default gen_random_uuid(),
  section_id         uuid references public.academic_sections (id) on delete set null,
  subject_id         uuid not null references public.subjects (id) on delete cascade,
  chapter_id         uuid references public.chapters (id) on delete set null,
  year               integer not null check (year between 1990 and 2100),
  exam               text not null,           -- e.g. "End Semester", "Mid Semester"
  question_number    integer,
  topic              text,
  difficulty         public.difficulty_level,
  question           text not null,           -- supports $inline$ and $$display$$ LaTeX
  solution           text,
  question_image_url text check (question_image_url is null or question_image_url ~* '^https://'),
  options            jsonb,                    -- optional ["A", "B", ...] for objective questions
  correct_answer     text,
  marks              numeric,
  is_published       boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists pyqs_subject_year_idx on public.pyqs (subject_id, year desc);
create index if not exists pyqs_section_idx on public.pyqs (section_id);

-- PYQ ⇄ related material
create table if not exists public.pyq_resources (
  pyq_id      uuid not null references public.pyqs (id) on delete cascade,
  resource_id uuid not null references public.resources (id) on delete cascade,
  primary key (pyq_id, resource_id)
);

-- ─── Bookmarks (future: signed-in students) ─────────────────────────────────
create table if not exists public.bookmarks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  resource_id uuid references public.resources (id) on delete cascade,
  pyq_id      uuid references public.pyqs (id) on delete cascade,
  created_at  timestamptz not null default now(),
  check (num_nonnulls(resource_id, pyq_id) = 1)
);
create unique index if not exists bookmarks_unique_idx
  on public.bookmarks (user_id, coalesce(resource_id, pyq_id));

-- ─── updated_at triggers ────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['profiles','academic_sections','subjects','chapters','resources','pyqs'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I
                    for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ════════════════════════════════════════════════════════════════════════════
--  Row Level Security
-- ════════════════════════════════════════════════════════════════════════════
alter table public.profiles          enable row level security;
alter table public.admins            enable row level security;
alter table public.academic_sections enable row level security;
alter table public.subjects          enable row level security;
alter table public.chapters          enable row level security;
alter table public.resources         enable row level security;
alter table public.pyqs              enable row level security;
alter table public.pyq_resources     enable row level security;
alter table public.bookmarks         enable row level security;

-- Explicit privileges (projects may not auto-expose new tables). RLS below
-- still decides which ROWS each role can see or change.
grant usage on schema public to anon, authenticated;
grant select on public.academic_sections, public.subjects, public.chapters,
                public.resources, public.pyqs, public.pyq_resources to anon, authenticated;
grant insert, update, delete on public.academic_sections, public.subjects, public.chapters,
                public.resources, public.pyqs, public.pyq_resources to authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.admins to authenticated;
grant select, insert, delete on public.bookmarks to authenticated;

-- profiles: a user sees/edits only their own row; admins see all.
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- admins: a user may check their own membership. No client writes at all —
-- admins are granted from the SQL editor (see README).
drop policy if exists "admins self read" on public.admins;
create policy "admins self read" on public.admins
  for select using (auth.uid() = user_id);

-- Public read policies
drop policy if exists "sections public read" on public.academic_sections;
create policy "sections public read" on public.academic_sections
  for select using (is_enabled or public.is_admin());

drop policy if exists "subjects public read" on public.subjects;
create policy "subjects public read" on public.subjects
  for select using (is_enabled or public.is_admin());

drop policy if exists "chapters public read" on public.chapters;
create policy "chapters public read" on public.chapters
  for select using (is_published or public.is_admin());

drop policy if exists "resources public read" on public.resources;
create policy "resources public read" on public.resources
  for select using (is_published or public.is_admin());

drop policy if exists "pyqs public read" on public.pyqs;
create policy "pyqs public read" on public.pyqs
  for select using (is_published or public.is_admin());

drop policy if exists "pyq_resources public read" on public.pyq_resources;
create policy "pyq_resources public read" on public.pyq_resources
  for select using (true);

-- Admin write policies
do $$
declare t text;
begin
  foreach t in array array['academic_sections','subjects','chapters','resources','pyqs','pyq_resources'] loop
    execute format('drop policy if exists "%s admin insert" on public.%I', t, t);
    execute format('create policy "%s admin insert" on public.%I for insert with check (public.is_admin())', t, t);
    execute format('drop policy if exists "%s admin update" on public.%I', t, t);
    execute format('create policy "%s admin update" on public.%I for update using (public.is_admin()) with check (public.is_admin())', t, t);
    execute format('drop policy if exists "%s admin delete" on public.%I', t, t);
    execute format('create policy "%s admin delete" on public.%I for delete using (public.is_admin())', t, t);
  end loop;
end $$;

-- bookmarks: owner only
drop policy if exists "bookmarks owner all" on public.bookmarks;
create policy "bookmarks owner all" on public.bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════════════════════
--  Seed configuration — structure only. NO resources, NO questions, NO chapters.
-- ════════════════════════════════════════════════════════════════════════════
insert into public.academic_sections (slug, name, display_order) values
  ('midsem-1',   'Midsem 1',   1),
  ('semester-1', 'Semester 1', 2),
  ('midsem-2',   'Midsem 2',   3),
  ('semester-2', 'Semester 2', 4),
  ('midsem-3',   'Midsem 3',   5),
  ('semester-3', 'Semester 3', 6),
  ('midsem-4',   'Midsem 4',   7),
  ('semester-4', 'Semester 4', 8)
on conflict (slug) do nothing;

insert into public.subjects (slug, name, description, display_order) values
  ('chemical-process-principles', 'Chemical Process Principles', 'Material and energy balances — the grammar of the discipline.', 1),
  ('mathematics',                 'Mathematics',                 'The language underneath every model and every unit operation.', 2),
  ('chemistry',                   'Chemistry',                   'Structure, bonding and reactivity — matter at its smallest scale.', 3),
  ('professional-communication',  'Professional Communication',  'Writing, speaking and presenting with clarity and intent.', 4),
  ('engineering-thermodynamics',  'Engineering Thermodynamics',  'Energy, entropy and equilibrium — the laws every process obeys.', 5),
  ('environment-climate',         'Environment & Climate',       'Systems, sustainability and the responsibility of the engineer.', 6)
on conflict (slug) do nothing;
