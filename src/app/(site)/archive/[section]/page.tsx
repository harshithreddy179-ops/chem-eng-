import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { SubjectIndex } from "@/components/archive/SubjectIndex";
import { sectionTheme } from "@/lib/palette";
import { getArchiveIndex, getSectionBySlug, getSections, getSubjects, resourceCount, trackableKeys } from "@/lib/data/public";
import { cn } from "@/lib/utils";

export const revalidate = 300;

type Params = { section: string };

export async function generateStaticParams() {
  const sections = await getSections();
  return sections.map((s) => ({ section: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { section: slug } = await params;
  const section = await getSectionBySlug(slug);
  if (!section) return { title: "Not found" };
  return {
    title: section.name,
    description: `${section.name}: notes, lecture slides and PYQs for every subject.`,
    alternates: { canonical: `/archive/${section.slug}` },
  };
}

export default async function SectionPage({ params }: { params: Promise<Params> }) {
  const { section: slug } = await params;
  const [section, subjects, index] = await Promise.all([getSectionBySlug(slug), getSubjects(), getArchiveIndex()]);
  if (!section) notFound();

  const t = sectionTheme(section.slug);
  const sectionKeys = trackableKeys(index, { sectionId: section.id });
  const totalResources = resourceCount(index, { sectionId: section.id });
  const rows = subjects.map((subject) => ({
    subject,
    href: `/archive/${section.slug}/${subject.slug}`,
    chapters: index.chapters.filter((c) => c.section_id === section.id && c.subject_id === subject.id).length,
    resources: resourceCount(index, { sectionId: section.id, subjectId: subject.id }),
    keys: trackableKeys(index, { sectionId: section.id, subjectId: subject.id }),
  }));

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/archive", label: "Study Material" }, { label: section.name }]}
        icon={
          <span className={cn("hidden h-14 w-14 shrink-0 place-items-center rounded-2xl text-white shadow-sm sm:grid", t.solid)}>
            <GraduationCap className="h-7 w-7" />
          </span>
        }
        title={section.name}
        subtitle={section.description ?? "Choose a subject to see its chapters, notes and question papers."}
        aside={
          <div className="card p-4">
            <ProgressBar keys={sectionKeys} label={`${section.name} progress`} size="sm" />
          </div>
        }
      />
      <div className="frame py-10">
        {totalResources === 0 && (
          <EmptyState
            compact
            className="mb-8"
            title={`Nothing added to ${section.name} yet`}
            message="Notes and question papers will show up inside each subject once they are uploaded."
          />
        )}
        <h2 className="mb-4 text-xl font-bold text-slate-900">Subjects</h2>
        <SubjectIndex rows={rows} />
      </div>
    </>
  );
}
