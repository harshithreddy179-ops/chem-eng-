"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Target } from "lucide-react";
import { PYQCard } from "./PYQCard";
import { PyqFilters, type FilterOptions } from "./PyqFilters";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Difficulty, Pyq } from "@/types";

export type VaultPyq = Pick<Pyq, "id" | "year" | "exam" | "question_number" | "topic" | "difficulty" | "question" | "marks"> & {
  subject: { slug: string; name: string } | null;
  section: { slug: string } | null;
};

type Params = { get(name: string): string | null; toString(): string };

const FILTER_KEYS = ["subject", "section", "year", "exam", "topic", "difficulty"] as const;

/** All questions are on the page already; filters just narrow them, instantly. */
function VaultBody({ pyqs, options, params, total }: { pyqs: VaultPyq[]; options: FilterOptions; params: Params; total: number }) {
  const f = Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) ?? ""])) as Record<(typeof FILTER_KEYS)[number], string>;
  const difficulty = ["easy", "medium", "hard"].includes(f.difficulty) ? (f.difficulty as Difficulty) : "";

  const shown = useMemo(
    () =>
      pyqs.filter(
        (q) =>
          (!f.subject || q.subject?.slug === f.subject) &&
          (!f.section || q.section?.slug === f.section) &&
          (!f.year || String(q.year) === f.year) &&
          (!f.exam || q.exam === f.exam) &&
          (!f.topic || q.topic === f.topic) &&
          (!difficulty || q.difficulty === difficulty),
      ),
    [pyqs, f.subject, f.section, f.year, f.exam, f.topic, difficulty],
  );

  const byYear = useMemo(() => {
    const m = new Map<number, VaultPyq[]>();
    for (const q of shown) m.set(q.year, [...(m.get(q.year) ?? []), q]);
    return [...m.entries()];
  }, [shown]);

  const activeSubject = options.subjects.find((s) => s.slug === f.subject);
  const practice = new URLSearchParams(
    Object.entries({ subject: f.subject, section: f.section, year: f.year, topic: f.topic, difficulty }).filter((e): e is [string, string] => Boolean(e[1])),
  ).toString();

  return (
    <>
      <div className="card p-4 md:p-5">
        <PyqFilters options={options} params={params} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] text-slate-600">
          Showing <b className="text-slate-900">{shown.length}</b> {shown.length === 1 ? "question" : "questions"}
          {activeSubject && (
            <>
              {" "}
              in <b className="text-slate-900">{activeSubject.name}</b>
            </>
          )}
        </p>
        {shown.length > 0 && (
          <Link href={`/pyqs/practice${practice ? `?${practice}` : ""}`} className="btn-luxe px-4 py-2 text-sm">
            <Target className="h-4 w-4 text-rose-500" /> Practise these
          </Link>
        )}
      </div>

      <div className="mt-4 space-y-10">
        {shown.length === 0 ? (
          <EmptyState
            title={total === 0 ? "No questions added yet" : "No questions match these filters"}
            message={total === 0 ? "Previous year questions will show up here once they are added." : "Try removing a filter, or clear them all."}
          />
        ) : (
          byYear.map(([year, items]) => (
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
    </>
  );
}

const EMPTY: Params = { get: () => null, toString: () => "" };

function WithParams(props: { pyqs: VaultPyq[]; options: FilterOptions; total: number }) {
  const params = useSearchParams();
  return <VaultBody {...props} params={params} />;
}

/** Same list with no filters applied; shown while the URL filters are read. */
function Unfiltered(props: { pyqs: VaultPyq[]; options: FilterOptions; total: number }) {
  return <VaultBody {...props} params={EMPTY} />;
}

export { WithParams as PyqVault, Unfiltered as PyqVaultUnfiltered };
