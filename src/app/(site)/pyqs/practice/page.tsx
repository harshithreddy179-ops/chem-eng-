import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { PracticeSession, type PracticeItem } from "@/components/pyq/PracticeSession";
import { QuestionStatement } from "@/components/pyq/QuestionViewer";
import { RelatedMaterial } from "@/components/pyq/RelatedMaterial";
import { MathText } from "@/components/pyq/MathText";
import { getPyqFacets, getPyqs, getSections, getSubjects, shuffle, type PyqFilters } from "@/lib/data/public";
import { DIFFICULTIES } from "@/lib/constants";
import type { Difficulty } from "@/types";
import { pad } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Practice",
  description: "A focused sequence of previous-year questions. Solve on paper, then reveal.",
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
      <div className="frame pb-10 pt-36 md:pt-44">
        <Breadcrumbs items={[{ href: "/pyqs", label: "PYQ Vault" }, { href: restart, label: "Practice" }, { label: "Session" }]} />
        <h1 className="sr-only">Practice session</h1>
        {items.length === 0 ? (
          <EmptyState
            title={facets.total === 0 ? "The vault is being filled" : "No questions match"}
            message={
              facets.total === 0
                ? "Practice sessions open once previous-year questions are added."
                : "Widen your choices to build a session."
            }
          >
            <Link href={restart} className="btn-luxe">
              ← Change choices
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
    { name: "section", label: "Academic section", value: filters.section, options: sections.map((s) => ({ value: s.slug, label: s.name })) },
    { name: "year", label: "Year", value: filters.year?.toString(), options: facets.years.map((y) => ({ value: String(y), label: String(y) })) },
    { name: "topic", label: "Topic", value: filters.topic, options: facets.topics.map((t) => ({ value: t, label: t })) },
    { name: "difficulty", label: "Difficulty", value: filters.difficulty, options: DIFFICULTIES.map((d) => ({ value: d.value, label: d.label })) },
  ];

  return (
    <div className="frame pb-10 pt-36 md:pt-44">
      <Breadcrumbs items={[{ href: "/pyqs", label: "PYQ Vault" }, { label: "Practice" }]} />
      <SectionHeading as="h1" size="xl" eyebrow="Practice mode" index="—" title={["Start", "practice"]} lede="Choose your ground. The archive deals the questions; you bring the paper." align="split" />

      <Reveal delay={0.2} className="mt-20 md:mt-28">
        <form method="get" action="/pyqs/practice" className="border-t border-line">
          <input type="hidden" name="start" value="1" />
          {selects.map((s, i) => (
            <div key={s.name} className="grid items-center gap-3 border-b border-line py-6 md:grid-cols-12 md:gap-8 md:py-8">
              <label htmlFor={`practice-${s.name}`} className="flex items-baseline gap-5 md:col-span-5">
                <span className="font-sans text-xs tabular tracking-[0.2em] text-bronze">{pad(i + 1)}</span>
                <span className="font-display text-3xl font-light uppercase md:text-4xl">{s.label}</span>
              </label>
              <div className="md:col-span-6 md:col-start-7">
                <select id={`practice-${s.name}`} name={s.name} defaultValue={s.value ?? ""} className="field text-lg">
                  <option value="">Any</option>
                  {s.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          <fieldset className="grid items-center gap-5 border-b border-line py-6 md:grid-cols-12 md:gap-8 md:py-8">
            <legend className="sr-only">Number of questions</legend>
            <div aria-hidden className="flex items-baseline gap-5 md:col-span-5">
              <span className="font-sans text-xs tabular tracking-[0.2em] text-bronze">{pad(selects.length + 1)}</span>
              <span className="font-display text-3xl font-light uppercase md:text-4xl">Questions</span>
            </div>
            <div className="flex flex-wrap gap-2 md:col-span-6 md:col-start-7">
              {COUNTS.map((n) => (
                <label key={n} className="cursor-pointer">
                  <input type="radio" name="count" value={n} defaultChecked={n === count} className="peer sr-only" />
                  <span className="grid h-12 w-14 place-items-center border border-line font-display text-xl tabular text-ivory-300 transition-colors duration-500 hover:border-ivory/40 peer-checked:border-bronze peer-checked:bg-bronze/15 peer-checked:text-ivory peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-bronze">
                    {n}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-col items-start justify-between gap-6 pt-10 md:flex-row md:items-center">
            <p className="max-w-md font-display text-xl italic text-ivory-400">
              {facets.total === 0
                ? "The vault is still being filled — sessions open once questions are added."
                : `${facets.total} questions available. Questions are drawn at random from your selection.`}
            </p>
            <button type="submit" className="btn-solid">
              Begin session →
            </button>
          </div>
        </form>
      </Reveal>
    </div>
  );
}
