import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProgressStat } from "@/components/ui/ProgressStat";
import { EmptyState } from "@/components/ui/EmptyState";
import { TextReveal } from "@/components/motion/TextReveal";
import { Reveal } from "@/components/motion/Reveal";
import { SubjectIndex } from "@/components/archive/SubjectIndex";
import {
  getArchiveIndex,
  getSectionBySlug,
  getSections,
  getSubjects,
  resourceCount,
  trackableKeys,
} from "@/lib/data/public";

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
    description: `${section.name} — lecture material, PYQs and chapter progress for every subject.`,
    alternates: { canonical: `/archive/${section.slug}` },
  };
}

export default async function SectionPage({ params }: { params: Promise<Params> }) {
  const { section: slug } = await params;
  const [section, subjects, index] = await Promise.all([getSectionBySlug(slug), getSubjects(), getArchiveIndex()]);
  if (!section) notFound();

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
    <div className="frame pb-10 pt-36 md:pt-44">
      <Breadcrumbs items={[{ href: "/archive", label: "Archive" }, { label: section.name }]} />

      <div className="grid gap-14 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <Reveal y={10}>
            <p className="eyebrow">
              <span className="text-bronze">Academic section</span> &nbsp;·&nbsp; {subjects.length} subjects
            </p>
          </Reveal>
          <TextReveal
            as="h1"
            immediate
            delay={0.1}
            className="mt-8 font-display text-display-xl font-light uppercase"
            lines={section.name.split(" ").map((w, i) => (i > 0 ? <em key={i} className="italic text-ivory-200">{w}</em> : w))}
          />
          <Reveal delay={0.5}>
            <p className="mt-8 font-sans text-xs uppercase tracking-[0.3em] text-bronze-300">
              <ProgressStat keys={sectionKeys} />
            </p>
            {section.description && (
              <p className="mt-6 max-w-lg font-display text-xl italic text-ivory-300">{section.description}</p>
            )}
          </Reveal>
        </div>
        <Reveal delay={0.4} className="md:col-span-4 md:col-start-9">
          <ProgressBar keys={sectionKeys} label={`${section.name} progress`} />
        </Reveal>
      </div>

      {totalResources === 0 && (
        <Reveal className="mt-20">
          <EmptyState
            compact
            index="Note"
            title={`${section.name} is being assembled`}
            message="Lectures, notes and question papers will appear inside each subject as they are added."
          />
        </Reveal>
      )}

      <section aria-label="Subjects" className="mt-20 md:mt-28">
        <Reveal className="mb-8 flex items-baseline justify-between">
          <h2 className="eyebrow">The subjects</h2>
          <span className="eyebrow text-ivory-500">Choose one</span>
        </Reveal>
        <SubjectIndex rows={rows} />
      </section>
    </div>
  );
}
