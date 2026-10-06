-- ════════════════════════════════════════════════════════════════════════════
--  THE CHEMICAL ARCHIVE — attendance
--  Run after 20261005000000_initial_schema.sql. Idempotent.
--
--  attendance_semesters ─┬─► attendance_courses ─► attendance_schedule (weekly)
--                        ├─► attendance_holidays
--                        ├─► attendance_special_classes (one-off dates)
--                        ├─► attendance_overrides (cancel / reschedule / day rules)
--                        └─► attendance_checkpoints (official attendance notices)
--
--  Only configuration lives here. A student's own Present / Absent marks
--  stay on their device (localStorage) in V1.
-- ════════════════════════════════════════════════════════════════════════════

do $$ begin
  create type public.attendance_class_type as enum ('lecture', 'lab', 'tutorial', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.attendance_override_action as enum ('cancel', 'reschedule', 'follow_weekday');
exception when duplicate_object then null; end $$;

-- A semester timetable (e.g. "Semester 1 · 2026–27 · Section L").
create table if not exists public.attendance_semesters (
  id             uuid primary key default gen_random_uuid(),
  section_id     uuid references public.academic_sections (id) on delete set null,
  name           text not null,
  academic_year  text not null,
  group_label    text,                         -- e.g. "Chemical Engineering · Section L"
  start_date     date not null,
  end_date       date not null,
  batches        text[] not null default '{}', -- e.g. {L1,L2} for split lab batches
  target_percent numeric not null default 85 check (target_percent > 0 and target_percent <= 100),
  is_published   boolean not null default true,
  display_order  integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  check (end_date >= start_date)
);

-- A course in that timetable. Attendance is counted per course.
create table if not exists public.attendance_courses (
  id            uuid primary key default gen_random_uuid(),
  semester_id   uuid not null references public.attendance_semesters (id) on delete cascade,
  code          text,
  name          text not null,
  subject_id    uuid references public.subjects (id) on delete set null,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  unique (semester_id, code)
);
create index if not exists attendance_courses_semester_idx on public.attendance_courses (semester_id, display_order);

-- The repeating weekly timetable. day_of_week: 1 = Monday … 7 = Sunday.
create table if not exists public.attendance_schedule (
  id          uuid primary key default gen_random_uuid(),
  semester_id uuid not null references public.attendance_semesters (id) on delete cascade,
  course_id   uuid not null references public.attendance_courses (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 1 and 7),
  start_time  time not null,
  end_time    time not null,
  class_type  public.attendance_class_type not null default 'lecture',
  room        text,
  faculty     text,
  batch       text,                            -- null = the whole section
  created_at  timestamptz not null default now(),
  check (end_time > start_time)
);
create index if not exists attendance_schedule_semester_day_idx on public.attendance_schedule (semester_id, day_of_week, start_time);

create table if not exists public.attendance_holidays (
  id          uuid primary key default gen_random_uuid(),
  semester_id uuid not null references public.attendance_semesters (id) on delete cascade,
  date        date not null,
  name        text not null,
  created_at  timestamptz not null default now(),
  unique (semester_id, date)
);

-- Extra / special classes on a specific date (also allowed on holidays).
create table if not exists public.attendance_special_classes (
  id          uuid primary key default gen_random_uuid(),
  semester_id uuid not null references public.attendance_semesters (id) on delete cascade,
  course_id   uuid not null references public.attendance_courses (id) on delete cascade,
  date        date not null,
  start_time  time not null,
  end_time    time not null,
  class_type  public.attendance_class_type not null default 'lecture',
  room        text,
  batch       text,
  notes       text,
  created_at  timestamptz not null default now(),
  check (end_time > start_time)
);
create index if not exists attendance_special_semester_date_idx on public.attendance_special_classes (semester_id, date);

-- Date-specific changes to the weekly timetable.
--   cancel         — schedule_id on date is cancelled by the department
--   reschedule     — schedule_id on date moves to new_date (+ optional new times)
--   follow_weekday — the whole date runs the timetable of follow_weekday
--                    (null = classes are held but the timetable is not yet set)
create table if not exists public.attendance_overrides (
  id             uuid primary key default gen_random_uuid(),
  semester_id    uuid not null references public.attendance_semesters (id) on delete cascade,
  date           date not null,
  action         public.attendance_override_action not null,
  schedule_id    uuid references public.attendance_schedule (id) on delete cascade,
  new_date       date,
  new_start_time time,
  new_end_time   time,
  follow_weekday smallint check (follow_weekday between 1 and 7),
  notes          text,
  created_at     timestamptz not null default now(),
  check (action <> 'cancel'     or schedule_id is not null),
  check (action <> 'reschedule' or (schedule_id is not null and new_date is not null)),
  check (action <> 'follow_weekday' or schedule_id is null)
);
create index if not exists attendance_overrides_semester_date_idx on public.attendance_overrides (semester_id, date);
create index if not exists attendance_overrides_new_date_idx on public.attendance_overrides (semester_id, new_date);

-- Official attendance notices. Students can start from the figures in a
-- notice; days from resume_date onward are tracked in the calendar.
create table if not exists public.attendance_checkpoints (
  id          uuid primary key default gen_random_uuid(),
  semester_id uuid not null references public.attendance_semesters (id) on delete cascade,
  label       text not null,
  as_of_date  date not null,
  resume_date date not null,
  created_at  timestamptz not null default now(),
  check (resume_date > as_of_date)
);

drop trigger if exists set_updated_at on public.attendance_semesters;
create trigger set_updated_at before update on public.attendance_semesters
  for each row execute function public.set_updated_at();

-- ─── Row Level Security ─────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['attendance_semesters','attendance_courses','attendance_schedule',
                           'attendance_holidays','attendance_special_classes','attendance_overrides',
                           'attendance_checkpoints'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format('drop policy if exists "%s public read" on public.%I', t, t);
    execute format('drop policy if exists "%s admin insert" on public.%I', t, t);
    execute format('drop policy if exists "%s admin update" on public.%I', t, t);
    execute format('drop policy if exists "%s admin delete" on public.%I', t, t);
    execute format('create policy "%s admin insert" on public.%I for insert with check (public.is_admin())', t, t);
    execute format('create policy "%s admin update" on public.%I for update using (public.is_admin()) with check (public.is_admin())', t, t);
    execute format('create policy "%s admin delete" on public.%I for delete using (public.is_admin())', t, t);
  end loop;
end $$;

-- Semesters: published ones are public. Children: public when their semester is.
create policy "attendance_semesters public read" on public.attendance_semesters
  for select using (is_published or public.is_admin());

do $$
declare t text;
begin
  foreach t in array array['attendance_courses','attendance_schedule','attendance_holidays',
                           'attendance_special_classes','attendance_overrides','attendance_checkpoints'] loop
    execute format(
      'create policy "%s public read" on public.%I for select using (
         public.is_admin() or exists (
           select 1 from public.attendance_semesters s where s.id = semester_id and s.is_published))', t, t);
  end loop;
end $$;
