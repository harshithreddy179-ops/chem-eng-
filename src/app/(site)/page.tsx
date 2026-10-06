import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Calculator,
  FileQuestion,
  GraduationCap,
  Search,
  Target,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { SubjectIcon } from "@/components/ui/SubjectIcon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { sectionTheme, subjectTheme } from "@/lib/palette";
import { getArchiveIndex, getPyqCountsBySubject, getSections, getSubjects, resourceCount, trackableKeys } from "@/lib/data/public";
import { INSTITUTION } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const revalidate = 300;

const QUICK: { href: string; title: string; text: string; icon: LucideIcon; tone: string }[] = [
  { href: "/archive", title: "Study Material", text: "Notes and lecture slides", icon: BookOpen, tone: "bg-brand-50 text-brand-600" },
  { href: "/pyqs", title: "PYQs", text: "Previous year questions", icon: FileQuestion, tone: "bg-orange-50 text-orange-600" },
  { href: "/pyqs/practice", title: "Practice", text: "Test yourself with PYQs", icon: Target, tone: "bg-rose-50 text-rose-600" },
  { href: "/tools/attendance", title: "Attendance", text: "Track your 75% easily", icon: CalendarCheck, tone: "bg-emerald-50 text-emerald-600" },
  { href: "/tools/calculator", title: "Calculator", text: "Scientific calculator", icon: Calculator, tone: "bg-violet-50 text-violet-600" },
  { href: "/tools/pomodoro", title: "Study Timer", text: "25-minute focus timer", icon: Timer, tone: "bg-amber-50 text-amber-600" },
];

export default async function HomePage() {
  const [sections, subjects, index, pyqCounts] = await Promise.all([getSections(), getSubjects(), getArchiveIndex(), getPyqCountsBySubject()]);
  const allKeys = trackableKeys(index);
  const totalPyqs = Object.values(pyqCounts).reduce((a, b) => a + b, 0);
  const totalFiles = index.resources.length;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-brand-50/80 via-white to-white">
        <div aria-hidden className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
        <div aria-hidden className="absolute -left-24 top-40 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="frame relative grid gap-10 py-12 md:py-16 lg:grid-cols-12 lg:items-center lg:py-20">
          <div className="lg:col-span-7">
            <span className="chip border border-brand-100 bg-white text-brand-700 shadow-sm">
              <GraduationCap className="h-4 w-4" /> {INSTITUTION} · Chemical Engineering
            </span>
            <h1 className="mt-5 font-display text-display-2xl font-bold text-slate-900">
              Everything you need for your <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">exams</span>, in one place
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Lecture notes, previous year questions (PYQs) and handy study tools, sorted by exam and subject.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/archive" className="btn-solid px-6 py-3.5 text-base">
                <BookOpen className="h-5 w-5" /> Browse Study Material
              </Link>
              <Link href="/pyqs" className="btn-luxe px-6 py-3.5 text-base">
                <FileQuestion className="h-5 w-5" /> Solve PYQs
              </Link>
            </div>
            <dl className="mt-9 grid max-w-lg grid-cols-3 gap-3">
              {[
                { n: subjects.length, l: "Subjects", c: "text-brand-600" },
                { n: totalFiles, l: "Study files", c: "text-orange-500" },
                { n: totalPyqs, l: "PYQs", c: "text-emerald-600" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl border border-line bg-white px-4 py-3 shadow-card">
                  <dt className="text-sm font-medium text-slate-500">{s.l}</dt>
                  <dd className={cn("text-2xl font-bold tabular", s.c)}>{s.n}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Quick access card */}
          <div className="lg:col-span-5">
            <div className="card p-5 md:p-6">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-slate-900">Quick access</p>
                <span className="chip bg-emerald-50 text-emerald-700">Free · No login</span>
              </div>
              <ul className="mt-4 grid grid-cols-2 gap-3">
                {QUICK.map((q) => (
                  <li key={q.href}>
                    <Link href={q.href} className="group flex h-full flex-col gap-3 rounded-xl border border-line p-3.5 transition hover:border-brand-200 hover:bg-brand-50/40">
                      <span className={cn("grid h-10 w-10 place-items-center rounded-xl", q.tone)}>
                        <q.icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block font-semibold text-slate-900">{q.title}</span>
                        <span className="block text-sm text-slate-500">{q.text}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Exams */}
      <section className="frame py-12 md:py-16" aria-labelledby="exams-heading">
        <SectionTitle id="exams-heading" title="Choose your exam" text="Pick an exam to see its subjects, notes and PYQs." href="/archive" link="See all" />
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {sections.map((s) => {
            const t = sectionTheme(s.slug);
            const files = resourceCount(index, { sectionId: s.id });
            return (
              <li key={s.id}>
                <Link href={`/archive/${s.slug}`} className="card card-hover flex h-full flex-col gap-3 p-4">
                  <span className={cn("grid h-11 w-11 place-items-center rounded-xl", t.soft, t.text)}>
                    <GraduationCap className="h-6 w-6" />
                  </span>
                  <span className="text-lg font-bold text-slate-900">{s.name}</span>
                  <span className={cn("text-sm font-medium", files ? "text-slate-500" : "text-slate-400")}>
                    {files ? `${files} files` : "Coming soon"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Subjects */}
      <section className="bg-page py-12 md:py-16" aria-labelledby="subjects-heading">
        <div className="frame">
          <SectionTitle id="subjects-heading" title="Subjects" text="Open a subject to see all its notes and PYQs across exams." />
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((s) => {
              const t = subjectTheme(s.slug);
              const keys = trackableKeys(index, { subjectId: s.id });
              const files = resourceCount(index, { subjectId: s.id });
              const pyqs = pyqCounts[s.id] ?? 0;
              return (
                <li key={s.id}>
                  <Link href={`/subjects/${s.slug}`} className="card card-hover group flex h-full items-center gap-4 p-4">
                    <SubjectIcon slug={s.slug} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[17px] font-bold leading-snug text-slate-900">{s.name}</span>
                      <span className="mt-1 flex flex-wrap gap-1.5">
                        <span className={cn("chip px-2 py-0.5 text-xs", t.soft, t.text)}>{files} files</span>
                        <span className="chip bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{pyqs} PYQs</span>
                      </span>
                    </span>
                    {keys.length > 0 ? (
                      <ProgressRing keys={keys} size={46} label={`${s.name} progress`} color={t.hex} />
                    ) : (
                      <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Progress + how it works */}
      <section className="frame grid gap-4 py-12 md:grid-cols-2 md:py-16">
        <div className="card p-6">
          <p className="text-lg font-bold text-slate-900">Your progress</p>
          <p className="mt-1 text-[15px] text-slate-500">Tick chapters and notes when you finish them. It&rsquo;s saved on this device, no account needed.</p>
          <ProgressBar keys={allKeys} label="All subjects" className="mt-5" />
        </div>
        <div className="card p-6">
          <p className="text-lg font-bold text-slate-900">How to use this site</p>
          <ol className="mt-4 space-y-3">
            {[
              ["Pick your exam", "Midsem 1, Semester 1 and so on."],
              ["Open a subject", "See chapters, notes and question papers."],
              ["Practise PYQs", "Solve on paper, then check related notes."],
            ].map(([a, b], i) => (
              <li key={a} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">{i + 1}</span>
                <span className="text-[15px] text-slate-600">
                  <b className="font-semibold text-slate-900">{a}</b> · {b}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="frame">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-violet-600 px-6 py-10 text-white md:px-12 md:py-12">
          <div aria-hidden className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
          <div aria-hidden className="absolute -bottom-16 right-40 h-40 w-40 rounded-full bg-white/10" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-display text-3xl font-bold md:text-4xl">Exam coming up?</p>
              <p className="mt-2 max-w-lg text-[17px] text-white/85">Start a quick practice set from real previous year questions.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/pyqs/practice" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50">
                <Target className="h-5 w-5" /> Start practice
              </Link>
              <span className="hidden items-center gap-2 rounded-xl border border-white/30 px-4 py-3.5 text-[15px] font-medium text-white/90 sm:inline-flex">
                <Search className="h-5 w-5" /> Press Ctrl K to search
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionTitle({ id, title, text, href, link }: { id: string; title: string; text?: string; href?: string; link?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 id={id} className="font-display text-display-md font-bold text-slate-900">
          {title}
        </h2>
        {text && <p className="mt-1 text-base text-slate-600">{text}</p>}
      </div>
      {href && (
        <Link href={href} className="link-luxe shrink-0">
          {link} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
