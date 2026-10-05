import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/motion/Reveal";
import { PYQCard } from "@/components/pyq/PYQCard";
import { PyqFilters } from "@/components/pyq/PyqFilters";
import { getPyqFacets, getPyqs, getSections, getSubjects, type PyqFilters as Filters } from "@/lib/data/public";
import type { Difficulty, PyqWithRelations } from "@/types";

export const metadata: Metadata = {
  title: "The PYQ Vault",
  description: "Previous-year questions by subject, exam, year, topic and difficulty — solve first, then reveal the solution.",
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
    <div className="frame pb-10 pt-36 md:pt-48">
      <SectionHeading
        as="h1"
        size="xl"
        index="—"
        eyebrow={activeSubject ? activeSubject.name : "Previous year questions"}
        title={["The PYQ", "Vault"]}
        lede="Previous-year questions, organised for practice. Solve on paper — then reveal."
        align="split"
      />

      <Reveal delay={0.2} className="mt-16 flex flex-col gap-8 border-y border-line py-10 md:mt-24 md:flex-row md:items-center md:justify-between">
        <p className="font-display text-2xl font-light text-ivory-200">
          <span className="tabular">{facets.total}</span> {facets.total === 1 ? "question" : "questions"} in the vault
          {facets.years.length > 0 && (
            <span className="text-ivory-400">
              {" "}
              · {facets.years[facets.years.length - 1]}–{facets.years[0]}
            </span>
          )}
        </p>
        <Link href={`/pyqs/practice${practiceQuery ? `?${practiceQuery}` : ""}`} className="btn-solid self-start md:self-auto">
          Start practice →
        </Link>
      </Reveal>

      <div className="mt-14">
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

      <div className="mt-20">
        {pyqs.length === 0 ? (
          <EmptyState
            title={facets.total === 0 ? "The vault is being filled" : "No questions match"}
            message={
              facets.total === 0
                ? "Previous-year questions will appear here as they are added."
                : "Try widening the filters — or clear them to see everything."
            }
          />
        ) : (
          [...byYear.entries()].map(([year, items]) => (
            <section key={year} aria-labelledby={`year-${year}`} className="mb-20 grid gap-8 md:grid-cols-12">
              <Reveal className="md:col-span-3">
                <h2 id={`year-${year}`} className="sticky top-28 font-display text-[5.5rem] font-light leading-none tabular text-ivory/90 md:text-[7rem]">
                  {year}
                </h2>
                <p className="eyebrow mt-3">{items.length} {items.length === 1 ? "question" : "questions"}</p>
              </Reveal>
              <div className="border-t border-line md:col-span-9">
                {items.map((q) => (
                  <PYQCard key={q.id} pyq={q} subjectName={activeSubject ? undefined : q.subject?.name} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
