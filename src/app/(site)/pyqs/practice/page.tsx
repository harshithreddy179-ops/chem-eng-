import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Play, Target } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { PracticeSession, type PracticeItem } from "@/components/pyq/PracticeSession";
import { QuestionStatement } from "@/components/pyq/QuestionViewer";
import { RelatedMaterial } from "@/components/pyq/RelatedMaterial";
import { MathText } from "@/components/pyq/MathText";
import { getPyqFacets, getPyqs, getSections, getSubjects, shuffle, type PyqFilters } from "@/lib/data/public";
import { DIFFICULTIES } from "@/lib/constants";
import type { Difficulty } from "@/types";

export const metadata: Metadata = {
  title: "Practice",
  description: "Practise with random previous year questions. Solve on paper, then check the solution.",
  alternates: { canonical: "/pyqs/practice" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const COUNTS = [5, 10, 15, 20, 30];

export default async function PracticePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const difficulty = one(sp.difficulty);
  const filters: PyqFilters = {
    subject: one(sp.subject),
    section: one(sp.section),
    year: Number(one(sp.year)) || undefined,
    topic: one(sp.topic),
    difficulty: ["easy", "medium", "hard"].includes(difficulty ?? "") ? (difficulty as Difficulty) : undefined,
  };
  const count = Math.min(Math.max(Number(one(sp.count)) || 10, 1), 50);
  const started = one(sp.start) === "1";

  const [subjects, sections, facets] = await Promise.all([getSubjects(), getSections(), getPyqFacets()]);

  if (started) {
    const pool = await getPyqs(filters, 500);
    const picked = shuffle(pool).slice(0, count);
    const restart = `/pyqs/practice?${new URLSearchParams(
      Object.entries({ ...filters, year: filters.year?.toString(), count: String(count) }).filter((e): e is [string, string] => Boolean(e[1])),
    )}`;

    const items: PracticeItem[] = picked.map((q) => ({
      id: q.id,
      title: `${q.subject?.name ?? ""} · ${q.year} · ${q.topic ?? `Q${q.question_number ?? ""}`}`,
      statement: <QuestionStatement pyq={q} heading="h2" />,
      solution: q.solution ? <MathText text={q.solution} /> : null,
      hasSolution: Boolean(q.solution),
      correctAnswer: q.correct_answer,
      related: <RelatedMaterial resources={q.related} subjectName={q.subject?.name} />,
    }));

    return (
      <div className="frame py-6 md:py-8">
        <Breadcrumbs items={[{ href: "/pyqs", label: "PYQs" }, { href: restart, label: "Practice" }, { label: "Session" }]} />
        <h1 className="sr-only">Practice session</h1>
        {items.length === 0 ? (
          <EmptyState
            title={facets.total === 0 ? "No questions added yet" : "No questions match your choices"}
            message={facets.total === 0 ? "Practice opens once previous year questions are added." : "Pick fewer filters and try again."}
          >
            <Link href={restart} className="btn-luxe">
              <ArrowLeft className="h-4 w-4" /> Change choices
            </Link>
          </EmptyState>
        ) : (
          <PracticeSession items={items} restartHref={restart} />
        )}
      </div>
    );
  }

  const selects: { name: string; label: string; value?: string; options: { value: string; label: string }[] }[] = [
    { name: "subject", label: "Subject", value: filters.subject, options: subjects.map((s) => ({ value: s.slug, label: s.name })) },
    { name: "section", label: "Exam", value: filters.section, options: sections.map((s) => ({ value: s.slug, label: s.name })) },
    { name: "year", label: "Year", value: filters.year?.toString(), options: facets.years.map((y) => ({ value: String(y), label: String(y) })) },
    { name: "topic", label: "Topic", value: filters.topic, options: facets.topics.map((t) => ({ value: t, label: t })) },
    { name: "difficulty", label: "Difficulty", value: filters.difficulty, options: DIFFICULTIES.map((d) => ({ value: d.value, label: d.label })) },
  ];

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/pyqs", label: "PYQs" }, { label: "Practice" }]}
        tint="from-rose-50 via-white to-orange-50"
        icon={
          <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-2xl bg-rose-500 text-white shadow-sm sm:grid">
            <Target className="h-7 w-7" />
          </span>
        }
        title="Practice PYQs"
        subtitle="Choose a subject and how many questions you want. We pick random questions for you to solve."
      />
      <div className="frame py-8">
        <form method="get" action="/pyqs/practice" className="card mx-auto max-w-3xl p-5 md:p-7">
          <input type="hidden" name="start" value="1" />
          <div className="grid gap-4 sm:grid-cols-2">
            {selects
              .filter((s) => s.name !== "topic" || s.options.length > 0)
              .map((s) => (
                <div key={s.name} className={s.name === "subject" ? "sm:col-span-2" : undefined}>
                  <label htmlFor={`practice-${s.name}`} className="field-label">
                    {s.label}
                  </label>
                  <select id={`practice-${s.name}`} name={s.name} defaultValue={s.value ?? ""} className="field">
                    <option value="">Any</option>
                    {s.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
          </div>
          <fieldset className="mt-5">
            <legend className="field-label">Number of questions</legend>
            <div className="flex flex-wrap gap-2">
              {COUNTS.map((n) => (
                <label key={n} className="cursor-pointer">
                  <input type="radio" name="count" value={n} defaultChecked={n === count} className="peer sr-only" />
                  <span className="grid h-11 min-w-14 place-items-center rounded-xl border border-slate-200 px-3 text-base font-semibold text-slate-700 transition hover:border-brand-300 peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-brand-100">
                    {n}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="mt-7 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[15px] text-slate-500">
              {facets.total === 0 ? "No questions added yet." : `${facets.total} questions available. Questions are picked at random.`}
            </p>
            <button type="submit" className="btn-solid px-6 py-3.5 text-base">
              <Play className="h-5 w-5" /> Start practice
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
