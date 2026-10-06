import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { AcademicSectionCard } from "@/components/archive/AcademicSectionCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { getArchiveIndex, getSections, getSubjects, resourceCount, trackableKeys } from "@/lib/data/public";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Study Material",
  description: "Notes, lecture slides and question papers for every exam, sorted by subject and chapter.",
  alternates: { canonical: "/archive" },
};

export default async function ArchivePage() {
  const [sections, subjects, index] = await Promise.all([getSections(), getSubjects(), getArchiveIndex()]);

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Study Material" }]}
        icon={
          <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white shadow-sm sm:grid">
            <BookOpen className="h-7 w-7" />
          </span>
        }
        title="Study Material"
        subtitle="Pick your exam to see its subjects, notes and question papers."
        aside={
          <div className="card p-4">
            <ProgressBar keys={trackableKeys(index)} label="Your overall progress" size="sm" />
          </div>
        }
      />
      <div className="frame py-10">
        {sections.length === 0 ? (
          <EmptyState title="No exams yet" message="Exams will show up here once they are set up." />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sections.map((section, i) => (
              <li key={section.id}>
                <AcademicSectionCard
                  section={section}
                  position={i + 1}
                  subjectCount={subjects.length}
                  resourceCount={resourceCount(index, { sectionId: section.id })}
                  progressKeys={trackableKeys(index, { sectionId: section.id })}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
