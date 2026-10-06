# The Chemical Archive

An academic resource and PYQ platform for Chemical Engineering students at **MNNIT Allahabad**: lecture material, previous-year questions, chapter-by-chapter progress and study tools in one place.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres, Auth, RLS) · Framer Motion · Lucide · KaTeX. Built to deploy on Vercel.

> Academic files are **never** stored in this repository or on the server. Admins paste Google Drive links; the site stores the URL and opens it in a new tab.

---

## Contents

1. [Local development](#1-local-development)
2. [Environment variables](#2-environment-variables)
3. [Supabase setup](#3-supabase-setup)
4. [Database migration](#4-database-migration)
5. [Creating the first admin](#5-creating-the-first-admin)
6. [Adding academic sections](#6-adding-academic-sections)
7. [Adding subjects](#7-adding-subjects)
8. [Adding chapters](#8-adding-chapters)
9. [Adding Google Drive resources](#9-adding-google-drive-resources)
10. [Adding PYQs](#10-adding-pyqs)
11. [Deploying to your repo and Vercel](#11-deploying-to-your-repo-and-vercel)
12. [Attendance: academic calendar & semester](#12-attendance-academic-calendar--semester)
13. [Attendance: weekly timetable](#13-attendance-weekly-timetable)
14. [Attendance: holidays, special classes & date changes](#14-attendance-holidays-special-classes--date-changes)
15. [Using attendance (students)](#15-using-attendance-students)
16. [Scientific calculator](#16-scientific-calculator)

Also covered: [how it works](#how-it-works), [project structure](#project-structure) and [security](#security).

---

## 1. Local development

Requirements: **Node.js 18.18+** (20 or 22 recommended) and npm.

```bash
npm install
cp .env.example .env.local        # then fill in your Supabase values (step 2)
npm run dev                        # http://localhost:3000
```

Useful scripts:

| Command             | What it does                      |
| ------------------- | --------------------------------- |
| `npm run dev`       | Development server                |
| `npm run build`     | Production build (what Vercel runs) |
| `npm start`         | Serve the production build        |
| `npm run lint`      | ESLint                            |
| `npm run typecheck` | TypeScript, no emit               |

**Without Supabase:** if the environment variables are missing, the public site still runs. It shows the eight sections and six subjects from a built-in structural fallback, with empty states everywhere. The admin portal needs Supabase.

**Optional: a fully local Supabase.** With Docker running:

```bash
npx supabase start   # applies supabase/migrations automatically
```

Use the printed `API_URL` and `ANON_KEY` in `.env.local`.

## 2. Environment variables

| Variable                        | Required | Description |
| ------------------------------- | -------- | ----------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | yes      | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes      | Supabase → Project Settings → API → `anon` public key (or the publishable key) |
| `NEXT_PUBLIC_SITE_URL`          | recommended | Your public URL, e.g. `https://chemical-archive.vercel.app`. Used for canonical URLs, the sitemap and OpenGraph. |

The anon key is designed to be public: Row Level Security decides what it can do. **The service-role key is not used by this app.** Never add it to the project, and never give it a `NEXT_PUBLIC_` prefix.

## 3. Supabase setup

1. Create a project at [supabase.com](https://supabase.com/dashboard).
2. Copy the Project URL and anon key into `.env.local` (and later into Vercel).
3. **Authentication → Providers → Email:** make sure Email is enabled.
4. **Authentication → Sign In / Providers:** turn **off** "Allow new users to sign up". Only you need an account, and you create it by hand (step 5). Students never sign in; their progress is stored on their own device.
5. Run the migration (step 4).

## 4. Database migration

The whole schema is in [`supabase/migrations/20261005000000_initial_schema.sql`](supabase/migrations/20261005000000_initial_schema.sql). It contains:

- **Tables:** `profiles`, `admins`, `academic_sections`, `subjects`, `chapters`, `resources`, `pyqs`, `pyq_resources` (links a PYQ to its related material) and `bookmarks` (reserved for future accounts).
- **Row Level Security** on every table, plus the `is_admin()` helper function.
- **Seed configuration only:** the 8 academic sections and the 6 subjects. It inserts **no** resources, chapters or questions.

Apply it in one of two ways:

- **SQL editor (simplest):** Supabase dashboard → SQL Editor → New query → paste the whole file → Run.
- **Supabase CLI:**
  ```bash
  npx supabase login
  npx supabase link --project-ref <your-project-ref>
  npx supabase db push
  ```

The script is idempotent, so running it twice is harmless.

**Then run the attendance migration** the same way: [`supabase/migrations/20261006000000_attendance.sql`](supabase/migrations/20261006000000_attendance.sql) (attendance tables and their RLS). The CLI's `db push` applies both files in order.

## 5. Creating the first admin

1. Supabase → **Authentication → Users → Add user → Create new user**. Enter your email and a strong password, and tick **Auto Confirm User**.
2. Supabase → **SQL Editor**, then run:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'you@example.com';
   ```
3. Visit **`/admin`** and sign in.

You can add more admins by repeating step 2 for each person. To revoke someone:

```sql
delete from public.admins where user_id = (select id from auth.users where email = 'them@example.com');
```

The site has no public link to `/admin`. A subtle **Admin** entry appears in the navigation only for a signed-in admin.

## 6. Adding academic sections

**Admin → Sections**

- **Rename:** click **Edit**, change the name, save. You can also change the URL slug, but that changes public URLs.
- **Reorder:** use the ↑ / ↓ arrows, or set Display order.
- **Disable:** untick **Enabled**. The section disappears from the public site, and its content is kept.
- **Add:** use the "Add a section" form at the bottom, e.g. `Midsem 5`. The slug is generated from the name.

The eight seeded sections are Midsem 1, Semester 1, Midsem 2, Semester 2, Midsem 3, Semester 3, Midsem 4 and Semester 4.

## 7. Adding subjects

**Admin → Subjects** works the same way as sections: edit the name or description, reorder, enable/disable, or add a new subject.

Every enabled subject appears inside every enabled section. The six seeded subjects each have their own line-drawn motif; any new subject gets a neutral one.

## 8. Adding chapters

**Admin → Chapters → + Add chapter** (or **Dashboard → + Add chapter**)

| Field            | Notes |
| ---------------- | ----- |
| Academic section | e.g. Midsem 1 |
| Subject          | e.g. Chemistry |
| Chapter name     | e.g. Periodic Properties |
| Description      | optional |
| Display order    | chapters are numbered in this order |
| Published        | hidden chapters are visible only to admins |

Every chapter automatically gets a **completed** checkbox for students and counts towards their progress.

## 9. Adding Google Drive resources

First, prepare the file in Google Drive: right-click → **Share** → General access: **Anyone with the link** → **Viewer** → **Copy link**.

Then go to **Admin → Resources → + Add resource**:

| Field              | Notes |
| ------------------ | ----- |
| Academic section, Subject | where it lives |
| Category           | **Lectures & Study Material** (left column), **PYQs** (right column) or **Other** ("Further Resources") |
| Chapter / topic    | optional; the list is filtered to the chosen section and subject |
| Title              | e.g. `Chemical Bonding` |
| Label              | short eyebrow, e.g. `Lecture 04` or `May 2024` |
| Resource type      | PPT, PDF, Notes, PYQ, Question Paper, Study Material or Other |
| Google Drive URL   | must start with `https://`. Non-Drive https links are allowed, with a warning. Use **Test link ↗** to check it. |
| Optional image URL | a small https thumbnail |
| Display order      | lower numbers appear first |
| Published          | on = live immediately |
| Completion checkbox | on = students can tick it off and it counts towards progress |

When you save, the public pages are revalidated and the resource is live straight away. Students click **Open ↗** and the Drive file opens in a new tab.

## 10. Adding PYQs

There are two kinds of PYQ content:

- **Whole question papers:** add them as a **Resource** with category **PYQs** and type *Question Paper* (step 9). They appear in the right-hand column of the subject page.
- **Individual questions** for the PYQ Vault and Practice mode: go to **Admin → PYQs → + Add PYQ**.

| Field | Notes |
| ----- | ----- |
| Subject *(required)*, Academic section *(optional)*, Chapter *(optional)* | |
| Year, Exam | e.g. `2025`, `End Semester` (presets are suggested) |
| Question number, Marks | optional |
| Topic, Difficulty | power the vault filters |
| Question | plain text with LaTeX: `$inline$` and `$$display$$`. A blank line starts a new paragraph. |
| Optional question image URL | https link to a diagram |
| Options | for objective questions, one per line; shown as A, B, C… |
| Correct answer | optional; revealed with the solution |
| Solution | revealed only when the student clicks **Reveal solution** |
| Related material | tick the lectures or notes this question draws on. They appear under **Related material** with an Open resource link. |

Example question text:

```
If $u = f(x, y)$ is homogeneous of degree $n$, show that
$$x\frac{\partial u}{\partial x} + y\frac{\partial u}{\partial y} = nu$$
```

There is no automatic grading. Students solve on paper, reveal the solution, and can mark themselves "I solved it" or "Needs review" during practice.

## 11. Deploying to your repo and Vercel

**Push to GitHub.** This code lives in `harshithreddy179-ops/chem-eng-` on the branch `claude/exciting-goodall-wbhwus`. Merge it into your default branch (open a PR on GitHub and merge it), or locally:

```bash
git checkout main
git merge claude/exciting-goodall-wbhwus
git push origin main
```

**Deploy on Vercel.**

1. [vercel.com/new](https://vercel.com/new) → **Import** `harshithreddy179-ops/chem-eng-`.
2. Framework preset: **Next.js** (auto-detected). Leave the build command (`next build`) and output settings as they are.
3. **Environment Variables:** add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SITE_URL` (your Vercel or custom domain).
4. Click **Deploy**. Every push to `main` redeploys automatically, and every other branch gets a preview URL.
5. Optional: Supabase → Authentication → URL Configuration → set **Site URL** to your production URL.

### Post-deploy checklist

- [ ] `/` loads; `/archive` shows 8 sections with "The archive is being assembled"
- [ ] `/admin` redirects to the sign-in page; your admin account signs in
- [ ] Add a chapter and a resource, then confirm they appear on `/archive/<section>/<subject>`
- [ ] Tick a checkbox, refresh, and confirm the progress persists
- [ ] `/tools/pomodoro` counts down
- [ ] `/sitemap.xml` and `/robots.txt` resolve


## 12. Attendance: academic calendar & semester

The attendance tool (`/tools/attendance`) is built from data you enter in **Admin → Attendance**. Nothing about your timetable is hard-coded.

**Fastest start (the current semester).** The odd semester 2026–27 for Chemical Engineering, Section L, is already transcribed from the official timetable and academic calendar in
[`supabase/seed/attendance_2026_27_odd_semester_section_l.sql`](supabase/seed/attendance_2026_27_odd_semester_section_l.sql).
Paste it into the Supabase SQL Editor and run it. It is safe to re-run: it replaces only that one semester. It contains:

- **Dates:** classes from Mon 20 Jul 2026 to Sat 14 Nov 2026. End of Classes is Fri 13 Nov; Sat 14 Nov is marked "First Year Classes".
- **Courses:** the 7 courses on the timetable, linked to the archive subjects where one exists. Engineering Graphics (MEN11601) has no archive subject.
- **Weekly timetable:** every cell of the timetable, one row per hour, with rooms. Engineering Graphics labs are split into batches **L1** (Tue) and **L2** (Thu).
- **Holidays:** the red dates in the calendar (Independence Day, Id-e-Milad, Janmashtami, Gandhi Jayanti, Dussehra, Diwali) plus the mid-semester break, 17–25 Oct.
- **Working Saturdays:** the 11 Saturdays marked "First Year Classes". These are added as working days with the timetable *to be announced*, because the calendar doesn't say which weekday's timetable runs. Set it under **Date changes** once it's announced.
- **Attendance notice:** the **1st Short Attendance Notification** (figures as of 8 Oct; tracking resumes Mon 26 Oct, after the mid-sem break).

**Setting up a new semester by hand:** **Admin → Attendance → + New semester**.

| Field | Notes |
|---|---|
| Semester name, Academic year | e.g. `Semester 2`, `2026–27` |
| Programme / section | e.g. `Chemical Engineering · Section L`; shown to students |
| First / last day of classes | from the academic calendar ("Start of Classes" / "End of Classes") |
| Archive section | links the timetable to an archive section (optional) |
| Lab batches | comma-separated, e.g. `L1, L2`; students choose theirs |
| Default target % | `85`; students can change their own |
| Published | unpublished semesters are hidden from students |

Then fill the tabs in order: **Courses → Weekly timetable → Holidays → Date changes → Attendance notices**.

## 13. Attendance: weekly timetable

1. **Courses tab:** add each course with its code and name, e.g. `MAN11101 · Mathematics 1`. Attendance is counted per course, so lectures, tutorials and labs of the same code add up together.
2. **Weekly timetable tab:** under each weekday click **+ Add class** and enter the course, start time, end time, type (Lecture / Lab / Tutorial / Other), room, faculty and batch. Leave **batch** empty for classes the whole section attends.

A 2-hour lab shown as two cells on the timetable can be entered as two 1-hour rows (each counts as one class) or as one 2-hour row (counts once). Use whichever matches how your department counts it.

## 14. Attendance: holidays, special classes & date changes

- **Holidays tab:** date and name, e.g. 26 Jan 2027 · Republic Day. The date turns red in the calendar and its timetable classes disappear, so they are never counted.
- **Special classes tab:** a one-off class on a specific date (an extra lecture, a Saturday class, even a class on a holiday). It is added to that day's timetable.
- **Date changes tab:** these override the weekly timetable for one date.
  - **Cancel a class:** pick the date and the timetable class. Students see "Cancelled by the department" and it never counts.
  - **Reschedule a class:** pick the date, the class and the new date. The new times are optional. The class disappears from the old date and appears on the new one.
  - **Whole day follows another timetable:** e.g. a working Saturday that runs Monday's timetable. Leave the weekday empty while it's still unannounced.
- **Attendance notices tab:** official notices students can start from, e.g. the 2nd Short Attendance Notification. Enter the date the figures are as of, and the first class day counted after it.

Every change is live on `/tools/attendance` as soon as you save.

## 15. Using attendance (students)

1. Open **Tools → Attendance**.
2. **Choose where to start:**
   - **From an attendance notice (recommended):** copy each subject's *attended* and *held* figures from the notice. The calendar takes over from the resume date, e.g. 26 Oct, after the mid-sem break.
   - **From the first day:** mark every class since the semester began.
3. Choose your **lab batch** (L1 / L2) so only your labs appear.
4. Click any date and mark each class **Present**, **Absent** or **Cancelled**. Click the active option again to clear it. "Mark the rest present" fills a whole day.
5. The overall figure, each subject's percentage, how many classes you can still miss (or must attend), and the history update instantly.

**Counting rules** (used for every number on the page):

| Mark | Held | Attended |
|---|---|---|
| Present | +1 | +1 |
| Absent | +1 | — |
| Cancelled (by you or the department) | — | — |
| Holidays, days with no classes, unmarked or upcoming classes | — | — |

The percentage is **attended ÷ held × 100**, computed from totals. It is never an average of subject percentages. Notice figures are added to the totals.

On an upcoming date, each class shows **"If you attend / If you miss"** projections. You can plan-mark future classes; they're labelled *Planned* and only count once the day has passed. Marks are saved privately in the browser (localStorage) and survive refreshes. The storage sits behind a small adapter (`src/lib/attendance/store.ts`), so syncing marks to Supabase for signed-in students can be added later.

## 16. Scientific calculator

Open it at **Tools → Scientific Calculator** (`/tools/calculator`), or from the **∑ CALC** button in the corner of every page. That opens the same calculator as a floating panel (a bottom sheet on phones) without leaving the page.

- **Functions:** + − × ÷, %, brackets, π, e, x², xʸ, √x, log, ln, eˣ, 10ˣ, sin / cos / tan and their inverses, n!, |x|, 1/x, **EXP** (scientific notation, e.g. `1.23E-6`) and **Ans**.
- **DEG / RAD** toggle. The current mode is always shown in the display.
- **Implicit multiplication** (`2π`, `3(4)`, `2sin(30)`), and brackets left open close themselves.
- **Results:** very large or small results display as `1.23 × 10⁻⁶`.
- **Errors:** division by zero, log of ≤ 0, square roots of negatives, invalid factorials, out-of-range inverse trig and malformed input show a short message instead of crashing.
- **History:** the last 50 calculations, kept on the device. Tap an expression to edit it again, tap a result to insert it, or **Clear history**.
- **Keyboard:** type normally; **Enter** or **=** calculates, **Backspace** deletes, **Esc** closes the floating panel (or clears on the calculator page). After a result, typing an operator continues from **Ans**.

The calculator parses expressions itself: no `eval`, no `Function()`.

### Tests

```bash
npm test   # attendance engine (holidays, cancellations, reschedules, batches, baselines, 85% maths) + calculator
```

---

## How it works

### Information architecture

```
/                              Home: hero, purpose, the three rooms, subjects, overall progress
/archive                       The Archive: the academic sections and overall progress
/archive/[section]             e.g. MIDSEM 1: section progress and the six subjects
/archive/[section]/[subject]   Subject page: chapters ☐, Lectures & Study Material | Previous Year Questions
/subjects/[subject]            One subject across every section
/pyqs                          PYQ Vault: filter by subject, section, year, exam, topic, difficulty
/pyqs/[id]                     A question: statement, Reveal solution, related material
/pyqs/practice                 Practice setup, then a session (?start=1)
/tools, /tools/pomodoro        Tools index and the Pomodoro timer
/admin/...                     Protected admin portal
```

### Progress (V1: no login)

- Every **chapter**, and every **resource** with "Completion checkbox" on, is a trackable item, keyed `chapter:<id>` or `resource:<id>`.
- Ticks are stored in the browser's `localStorage` (`chemical-archive:progress:v1`) and sync across open tabs.
- Percentages are always computed from real items: subject = its items in that section; section = all its items; overall = all items. Deleting content removes it from the totals automatically. With nothing to track, the site shows "—", not 0% or invented numbers.
- `src/lib/progress/store.ts` exposes a `ProgressAdapter` interface. To add cloud-synced progress later, write a Supabase adapter (for signed-in students) and call `setProgressAdapter()`. Components don't change.

### Caching

Public pages are statically generated and revalidated every 5 minutes (ISR). Every admin save calls `revalidatePath`, so admin changes appear immediately. If you edit rows directly in the Supabase dashboard, allow up to 5 minutes for them to show.

### Search

Press **⌘K / Ctrl K** (or the search button). Search covers sections, subjects, chapters, resources and PYQs, grouped by type. The index is served from `/api/search` and cached at the edge.

### Pomodoro

Defaults are 25 / 5 / 15 minutes, with a long break every 4 rounds, all configurable. Durations and preferences are saved per device. Timing uses the wall clock, so it stays accurate in background tabs. The chime is synthesised, so there is no audio file to download. Notifications are opt-in. Keyboard: **Space** start/pause · **R** reset · **S** skip · **1 / 2 / 3** modes.

### Adding a new tool later

Add an entry to `src/lib/tools.ts` with status `available`, and create `src/app/(site)/tools/<slug>/page.tsx`. The Tools page renders from the registry.

## Project structure

```
src/
  actions/        Server Actions: admin CRUD (zod-validated) and auth
  app/
    (site)/       Public routes, header/footer layout, page transitions
    admin/        login/ and (console)/ (protected admin pages)
    api/search/   Search index route
    sitemap.ts, robots.ts, opengraph-image.tsx, icon.svg
  components/
    layout/       SiteHeader (nav, mobile menu, ⌘K), SiteFooter
    home/         Hero, Purpose, Pillars, SubjectList
    archive/      AcademicSectionCard, SubjectIndex, ResourceList, ResourceItem, ChapterChecklist
    pyq/          PYQCard, QuestionViewer, SolutionReveal, PracticeSession, PyqFilters, MathText
    tools/        PomodoroTimer, ToolGlyph
    attendance/   AttendanceApp, AttendanceCalendar, DayDetail, StatusControl, StartSetup, Summary, History
    calculator/   Calculator, FloatingCalculator
    admin/        AdminSidebar, AdminTable, AdminForm, Resource/Chapter/Pyq forms, TaxonomyManager,
                  attendance/ (RecordEditor, field definitions, semester settings)
    search/       SearchCommand
    ui/           SectionHeading, EmptyState, ProgressBar, ProgressRing, CompletionCheckbox, Breadcrumbs
    visual/       HeroArchitecture (SVG), SubjectMotif
    motion/       Reveal, TextReveal
  hooks/          use-progress, use-admin-form, use-is-admin, use-hotkey
  lib/            supabase clients, data access (public and admin), auth, progress store, constants,
                  attendance/ (pure engine, dates, local store), calculator/ (parser + formatter)
  styles/         globals.css (design tokens, components)
  types/          Domain types
supabase/
  migrations/     Schema, RLS and seed configuration (incl. attendance)
  seed/           Real semester data (attendance) — run in the SQL editor
tests/            node:test suites (npm test)
```

## Security

- **Defence in depth for admin.** Middleware redirects unauthenticated `/admin` requests. Every admin page calls `requireAdmin()`, and every Server Action re-checks `is_admin()` on the server. Postgres RLS then rejects any write from a non-admin, even with a hand-crafted API request.
- The public site reads only through the anon key. RLS limits it to published content and enabled sections/subjects; the app additionally hides content that belongs to a disabled section or subject.
- The `admins` table has no write policy, so admins can only be granted from the SQL editor.
- URLs are validated to be `https://`, both in the app (zod) and in the database (CHECK constraints). External links open with `rel="noopener noreferrer"`.
- No service-role key anywhere in the app.

## Accessibility & performance

- Semantic landmarks, a skip link, visible focus rings, ARIA on custom controls (checkboxes, progress, combobox search, timer), keyboard support throughout, and every animation respects `prefers-reduced-motion`.
- Server Components by default. The heavy pieces are rendered on the server: KaTeX ships no JavaScript to the client, and the hero visual is inline SVG with no image downloads. Search loads lazily on first open, and fonts are self-hosted (Latin subsets only).
