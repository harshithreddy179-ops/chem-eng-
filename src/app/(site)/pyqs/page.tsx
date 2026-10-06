import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FileQuestion, Target } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { PYQCard } from "@/components/pyq/PYQCard";
import { PyqFilters } from "@/components/pyq/PyqFilters";
import { getPyqFacets, getPyqs, getSections, getSubjects, type PyqFilters as Filters } from "@/lib/data/public";
import type { Difficulty, PyqWithRelations } from "@/types";

export const metadata: Metadata = {
  title: "PYQs",
  description: "Previous year questions by subject, exam, year and difficulty. Solve first, then check the related notes.",
  alternates: { canonical: "/pyqs" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function PyqVaultPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const difficulty = one(sp.difficulty);
  const filters: Filters = {
    subject: one(sp.subject) || undefined,
    section: one(sp.section) || undefined,
    year: Number(one(sp.year)) || undefined,
    exam: one(sp.exam) || undefined,
    topic: one(sp.topic) || undefined,
    difficulty: ["easy", "medium", "hard"].includes(difficulty ?? "") ? (difficulty as Difficulty) : undefined,
  };

  const [subjects, sections, facets, pyqs] = await Promise.all([getSubjects(), getSections(), getPyqFacets(), getPyqs(filters)]);
  const activeSubject = subjects.find((s) => s.slug === filters.subject);

  const byYear = pyqs.reduce<Map<number, PyqWithRelations[]>>((acc, q) => {
    acc.set(q.year, [...(acc.get(q.year) ?? []), q]);
    return acc;
  }, new Map());

  const practiceQuery = new URLSearchParams(
    Object.entries({ subject: filters.subject, section: filters.section, year: filters.year?.toString(), topic: filters.topic, difficulty: filters.difficulty }).filter(
      (e): e is [string, string] => Boolean(e[1]),
    ),
  ).toString();

  return (
    <>
      <PageHeader
        crumbs={[{ label: "PYQs" }]}
        tint="from-orange-50 via-white to-rose-50"
        icon={
          <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-2xl bg-orange-500 text-white shadow-sm sm:grid">
            <FileQuestion className="h-7 w-7" />
          </span>
        }
        title="Previous Year Questions"
        subtitle={`${facets.total} questions from past exams${facets.years.length ? ` (${facets.years[facets.years.length - 1]}–${facets.years[0]})` : ""}. Solve on paper, then check the related notes.`}
        aside={
          <Link href={`/pyqs/practice${practiceQuery ? `?${practiceQuery}` : ""}`} className="btn-solid w-full py-3.5 text-base">
            <Target className="h-5 w-5" /> Start a practice set
          </Link>
        }
      />

      <div className="frame py-8">
        <div className="card p-4 md:p-5">
          <Suspense>
            <PyqFilters
              options={{
                subjects: subjects.map((s) => ({ slug: s.slug, name: s.name })),
                sections: sections.map((s) => ({ slug: s.slug, name: s.name })),
                years: facets.years,
                exams: facets.exams,
                topics: facets.topics,
              }}
            />
          </Suspense>
        </div>

        <p className="mt-6 text-[15px] text-slate-600">
          Showing <b className="text-slate-900">{pyqs.length}</b> {pyqs.length === 1 ? "question" : "questions"}
          {activeSubject && (
            <>
              {" "}
              in <b className="text-slate-900">{activeSubject.name}</b>
            </>
          )}
        </p>

        <div className="mt-4 space-y-10">
          {pyqs.length === 0 ? (
            <EmptyState
              title={facets.total === 0 ? "No questions added yet" : "No questions match these filters"}
              message={facets.total === 0 ? "Previous year questions will show up here once they are added." : "Try removing a filter, or clear them all."}
            />
          ) : (
            [...byYear.entries()].map(([year, items]) => (
              <section key={year} aria-labelledby={`year-${year}`}>
                <h2 id={`year-${year}`} className="mb-3 flex items-center gap-3 text-xl font-bold text-slate-900">
                  <span className="rounded-xl bg-slate-900 px-3 py-1 text-white tabular">{year}</span>
                  <span className="text-base font-medium text-slate-500">
                    {items.length} {items.length === 1 ? "question" : "questions"}
                  </span>
                </h2>
                <ul className="grid gap-3 md:grid-cols-2">
                  {items.map((q) => (
                    <li key={q.id}>
                      <PYQCard pyq={q} subjectName={activeSubject ? undefined : q.subject?.name} />
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </>
  );
}
