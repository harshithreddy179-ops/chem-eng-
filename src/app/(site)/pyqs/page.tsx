import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FileQuestion, Target } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PyqVault, PyqVaultUnfiltered, type VaultPyq } from "@/components/pyq/PyqVault";
import { getPyqFacets, getPyqs, getSections, getSubjects } from "@/lib/data/public";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "PYQs",
  description: "Previous year questions by subject, exam, year and difficulty. Solve first, then check the related notes.",
  alternates: { canonical: "/pyqs" },
};

/** Pre-built page with every question; filtering happens in the browser. */
export default async function PyqVaultPage() {
  const [subjects, sections, facets, all] = await Promise.all([getSubjects(), getSections(), getPyqFacets(), getPyqs()]);

  const pyqs: VaultPyq[] = all.map((q) => ({
    id: q.id,
    year: q.year,
    exam: q.exam,
    question_number: q.question_number,
    topic: q.topic,
    difficulty: q.difficulty,
    question: q.question,
    marks: q.marks,
    subject: q.subject ? { slug: q.subject.slug, name: q.subject.name } : null,
    section: q.section ? { slug: q.section.slug } : null,
  }));
  const options = {
    subjects: subjects.map((s) => ({ slug: s.slug, name: s.name })),
    sections: sections.map((s) => ({ slug: s.slug, name: s.name })),
    years: facets.years,
    exams: facets.exams,
    topics: facets.topics,
  };

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
          <Link href="/pyqs/practice" className="btn-solid w-full py-3.5 text-base">
            <Target className="h-5 w-5" /> Start a practice set
          </Link>
        }
      />
      <div className="frame py-8">
        <Suspense fallback={<PyqVaultUnfiltered pyqs={pyqs} options={options} total={facets.total} />}>
          <PyqVault pyqs={pyqs} options={options} total={facets.total} />
        </Suspense>
      </div>
    </>
  );
}
