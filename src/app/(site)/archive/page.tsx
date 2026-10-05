import type { Metadata } from "next";
import { AcademicSectionCard } from "@/components/archive/AcademicSectionCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/motion/Reveal";
import { getArchiveIndex, getSections, getSubjects, resourceCount, trackableKeys } from "@/lib/data/public";
import { cn } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "The Archive",
  description: "Course material for every exam — midsems and semesters, organised by subject and chapter.",
  alternates: { canonical: "/archive" },
};

export default async function ArchivePage() {
  const [sections, subjects, index] = await Promise.all([getSections(), getSubjects(), getArchiveIndex()]);
  const totalResources = resourceCount(index);

  return (
    <div className="frame pb-10 pt-36 md:pt-48">
      <SectionHeading
        as="h1"
        size="xl"
        eyebrow="Resources"
        index="—"
        title="The Archive"
        lede="Your course material, organised."
        align="split"
      />

      <Reveal delay={0.2} className="mt-20 grid gap-12 border-y border-line py-10 md:mt-28 md:grid-cols-12 md:items-end">
        <div className="md:col-span-5">
          <p className="font-display text-2xl font-light leading-snug text-ivory-200">
            {sections.length} academic sections · {subjects.length} subjects ·{" "}
            <span className="tabular">{totalResources}</span> resources
          </p>
          <p className="mt-3 font-sans text-sm text-ivory-400">Choose an exam to see its subjects and your progress.</p>
        </div>
        <ProgressBar keys={trackableKeys(index)} label="Your overall progress" size="sm" className="md:col-span-5 md:col-start-8" />
      </Reveal>

      {totalResources === 0 && (
        <Reveal className="mt-16">
          <EmptyState
            compact
            index="Note"
            title="The archive is being assembled"
            message="Resources will appear here as they are added. Every section below is ready for them."
          />
        </Reveal>
      )}

      {sections.length === 0 ? (
        <EmptyState className="mt-16" title="No sections yet" message="Academic sections will appear here once they are configured." />
      ) : (
        <ol className="mt-16 grid gap-5 md:mt-24 md:grid-cols-2 md:gap-6">
          {sections.map((section, i) => (
            <Reveal as="li" key={section.id} delay={(i % 2) * 0.12} className={cn(i % 2 === 1 && "md:mt-24")}>
              <AcademicSectionCard
                section={section}
                position={i + 1}
                subjectCount={subjects.length}
                resourceCount={resourceCount(index, { sectionId: section.id })}
                progressKeys={trackableKeys(index, { sectionId: section.id })}
              />
            </Reveal>
          ))}
        </ol>
      )}
    </div>
  );
}
