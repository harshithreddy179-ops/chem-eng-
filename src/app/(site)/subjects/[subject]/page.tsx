import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { TextReveal } from "@/components/motion/TextReveal";
import { Reveal } from "@/components/motion/Reveal";
import { SubjectMotif } from "@/components/visual/SubjectMotif";
import {
  getArchiveIndex,
  getPyqCountsBySubject,
  getSections,
  getSubjectBySlug,
  getSubjects,
  resourceCount,
  trackableKeys,
} from "@/lib/data/public";
import { pad } from "@/lib/utils";

export const revalidate = 300;

type Params = { subject: string };

export async function generateStaticParams() {
  const subjects = await getSubjects();
  return subjects.map((s) => ({ subject: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { subject: slug } = await params;
  const subject = await getSubjectBySlug(slug);
  if (!subject) return { title: "Not found" };
  return {
    title: subject.name,
    description: subject.description ?? `${subject.name} across every exam in The Chemical Archive.`,
    alternates: { canonical: `/subjects/${subject.slug}` },
  };
}

/** A subject across every academic section. */
export default async function SubjectHubPage({ params }: { params: Promise<Params> }) {
  const { subject: slug } = await params;
  const [subject, sections, index, pyqCounts] = await Promise.all([
    getSubjectBySlug(slug),
    getSections(),
    getArchiveIndex(),
    getPyqCountsBySubject(),
  ]);
  if (!subject) notFound();
  const keys = trackableKeys(index, { subjectId: subject.id });
  const pyqCount = pyqCounts[subject.id] ?? 0;

  return (
    <div className="frame pb-10 pt-36 md:pt-44">
      <Breadcrumbs items={[{ href: "/archive", label: "Archive" }, { label: subject.name }]} />
      <div className="grid gap-16 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <Reveal y={10}>
            <p className="eyebrow">
              <span className="text-bronze">Subject</span> &nbsp;·&nbsp; Across {sections.length} sections
            </p>
          </Reveal>
          <TextReveal as="h1" immediate delay={0.1} className="mt-8 font-display text-display-lg font-light uppercase" lines={[subject.name]} />
          {subject.description && (
            <Reveal delay={0.4}>
              <p className="mt-8 max-w-xl font-display text-2xl italic leading-snug text-ivory-200">{subject.description}</p>
            </Reveal>
          )}
        </div>
        <Reveal delay={0.3} className="lg:col-span-4 lg:col-start-9">
          <div className="mb-10 aspect-[5/4] border border-line p-8 text-ivory/50">
            <SubjectMotif slug={subject.slug} />
          </div>
          <ProgressBar keys={keys} label="Progress in this subject" size="sm" />
        </Reveal>
      </div>

      <section aria-label="Sections" className="mt-24 md:mt-32">
        <Reveal className="mb-8 flex items-baseline justify-between">
          <h2 className="eyebrow">Choose an exam</h2>
          <Link href={`/pyqs?subject=${subject.slug}`} className="link-luxe text-bronze-300">
            {pyqCount > 0 ? `${pyqCount} questions in the vault →` : "PYQ vault →"}
          </Link>
        </Reveal>
        <ol className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((section, i) => {
            const sKeys = trackableKeys(index, { sectionId: section.id, subjectId: subject.id });
            const count = resourceCount(index, { sectionId: section.id, subjectId: subject.id });
            return (
              <li key={section.id} className="border-b border-line sm:odd:border-r lg:border-r lg:[&:nth-child(4n)]:border-r-0">
                <Link
                  href={`/archive/${section.slug}/${subject.slug}`}
                  className="group flex h-full min-h-[13rem] flex-col justify-between p-6 transition-colors duration-700 hover:bg-ivory/[0.025] md:p-8"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-sans text-[0.62rem] tabular tracking-[0.3em] text-bronze">{pad(i + 1)}</span>
                    <ProgressRing keys={sKeys} size={40} label={`${section.name} progress`} />
                  </div>
                  <div>
                    <p className="font-display text-3xl font-light uppercase transition-transform duration-700 ease-luxe group-hover:translate-x-1.5">
                      {section.name}
                    </p>
                    <p className="mt-2 font-sans text-[0.62rem] uppercase tracking-[0.24em] text-ivory-500">
                      <span className="tabular">{count}</span> resources
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
