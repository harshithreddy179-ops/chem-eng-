import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProgressStat } from "@/components/ui/ProgressStat";
import { TextReveal } from "@/components/motion/TextReveal";
import { Reveal } from "@/components/motion/Reveal";
import { ResourceList } from "@/components/archive/ResourceList";
import { ChapterChecklist } from "@/components/archive/ChapterChecklist";
import { PYQCard } from "@/components/pyq/PYQCard";
import { SubjectMotif } from "@/components/visual/SubjectMotif";
import { getSectionBySlug, getSections, getSubjectBySlug, getSubjectContent, getSubjects } from "@/lib/data/public";
import type { ProgressKey } from "@/types";

export const revalidate = 300;

type Params = { section: string; subject: string };

export async function generateStaticParams() {
  const [sections, subjects] = await Promise.all([getSections(), getSubjects()]);
  return sections.flatMap((section) => subjects.map((subject) => ({ section: section.slug, subject: subject.slug })));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { section: sectionSlug, subject: subjectSlug } = await params;
  const [section, subject] = await Promise.all([getSectionBySlug(sectionSlug), getSubjectBySlug(subjectSlug)]);
  if (!section || !subject) return { title: "Not found" };
  return {
    title: `${subject.name} · ${section.name}`,
    description: `${subject.name} for ${section.name}: lectures, study material and previous-year questions.`,
    alternates: { canonical: `/archive/${section.slug}/${subject.slug}` },
  };
}

export default async function SubjectPage({ params }: { params: Promise<Params> }) {
  const { section: sectionSlug, subject: subjectSlug } = await params;
  const [section, subject, subjects] = await Promise.all([
    getSectionBySlug(sectionSlug),
    getSubjectBySlug(subjectSlug),
    getSubjects(),
  ]);
  if (!section || !subject) notFound();

  const { chapters, resources, pyqs } = await getSubjectContent(section.id, subject.id);
  const lectures = resources.filter((r) => r.category === "lecture");
  const pyqResources = resources.filter((r) => r.category === "pyq");
  const others = resources.filter((r) => r.category === "other");

  const keys: ProgressKey[] = [
    ...chapters.map((c) => `chapter:${c.id}` as const),
    ...resources.filter((r) => r.is_trackable).map((r) => `resource:${r.id}` as const),
  ];

  const position = subjects.findIndex((s) => s.id === subject.id);
  const next = subjects[(position + 1) % subjects.length];
  const prev = subjects[(position - 1 + subjects.length) % subjects.length];

  return (
    <div className="pb-10 pt-36 md:pt-44">
      <div className="frame">
        <Breadcrumbs
          items={[
            { href: "/archive", label: "Archive" },
            { href: `/archive/${section.slug}`, label: section.name },
            { label: subject.name },
          ]}
        />

        {/* ─── Masthead ─────────────────────────────────────────────── */}
        <header className="relative grid gap-14 md:grid-cols-12 md:items-end">
          <div aria-hidden className="pointer-events-none absolute -right-6 -top-16 hidden h-72 w-96 text-ivory/[0.07] lg:block">
            <SubjectMotif slug={subject.slug} />
          </div>
          <div className="relative md:col-span-8">
            <Reveal y={10}>
              <p className="eyebrow">
                <span className="text-bronze">{section.name}</span> &nbsp;·&nbsp; Subject {String(position + 1).padStart(2, "0")}
              </p>
            </Reveal>
            <TextReveal
              as="h1"
              immediate
              delay={0.1}
              className="mt-8 font-display text-display-lg font-light uppercase"
              lines={[subject.name]}
            />
            <Reveal delay={0.45}>
              <p className="mt-6 font-display text-2xl italic text-ivory-200 md:text-3xl">All you need, in one place.</p>
              <p className="mt-6 font-sans text-xs uppercase tracking-[0.3em] text-bronze-300">
                <ProgressStat keys={keys} />
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.4} className="relative md:col-span-4">
            <ProgressBar keys={keys} label={`${subject.name}`} />
          </Reveal>
        </header>

        {/* ─── Chapters ─────────────────────────────────────────────── */}
        {chapters.length > 0 && (
          <section aria-labelledby="chapters-title" className="mt-24 md:mt-32">
            <Reveal className="mb-8 flex items-baseline justify-between gap-6">
              <h2 id="chapters-title" className="flex items-baseline gap-4 font-sans text-xs uppercase tracking-[0.3em] text-ivory-200">
                <span className="text-bronze">§</span> Chapters &amp; Topics
              </h2>
              <span className="font-sans text-[0.62rem] uppercase tracking-[0.24em] text-ivory-500">Tick as you finish</span>
            </Reveal>
            <ChapterChecklist chapters={chapters} resources={resources} />
          </section>
        )}

        {/* ─── Two-column resources ─────────────────────────────────── */}
        <div className="mt-24 grid gap-20 md:mt-32 lg:grid-cols-2 lg:gap-16 xl:gap-24">
            <ResourceList
              id="lectures-title"
              index="I"
              title="Lectures & Study Material"
              resources={lectures}
              chapters={chapters}
              emptyTitle="No lectures yet"
              emptyMessage="Lecture slides and notes will appear here."
            />
            <div className="min-w-0 lg:pt-24">
              <ResourceList
                id="pyqs-title"
                index="II"
                title="Previous Year Questions"
                resources={pyqResources}
                chapters={chapters}
                emptyTitle="No papers yet"
                emptyMessage="Question papers from past exams will appear here."
              />
            </div>
          </div>

        {others.length > 0 && (
          <div className="mt-24 md:mt-32 lg:w-1/2">
            <ResourceList
              id="others-title"
              index="III"
              title="Further Resources"
              resources={others}
              chapters={chapters}
              emptyTitle=""
              emptyMessage=""
            />
          </div>
        )}

        {/* ─── Individual questions from the vault ──────────────────── */}
        {pyqs.length > 0 && (
          <section aria-labelledby="vault-title" className="mt-24 md:mt-32">
            <Reveal className="mb-8 flex flex-wrap items-baseline justify-between gap-6">
              <h2 id="vault-title" className="flex items-baseline gap-4 font-sans text-xs uppercase tracking-[0.3em] text-ivory-200">
                <span className="text-bronze">IV</span> From the PYQ Vault
              </h2>
              <Link
                href={`/pyqs/practice?subject=${subject.slug}&section=${section.slug}`}
                className="link-luxe text-bronze-300"
              >
                Practise these →
              </Link>
            </Reveal>
            <div className="border-t border-line">
              {pyqs.slice(0, 12).map((q) => (
                <PYQCard key={q.id} pyq={q} />
              ))}
            </div>
            {pyqs.length > 12 && (
              <Link href={`/pyqs?subject=${subject.slug}&section=${section.slug}`} className="link-luxe mt-8">
                All {pyqs.length} questions →
              </Link>
            )}
          </section>
        )}
      </div>

      {/* ─── Neighbouring subjects ──────────────────────────────────── */}
      {subjects.length > 1 && (
        <nav aria-label="Other subjects" className="frame mt-32 grid border-y border-line md:grid-cols-2">
          {[
            { s: prev, dir: "Previous" },
            { s: next, dir: "Next" },
          ].map(({ s, dir }) => (
            <Link
              key={dir}
              href={`/archive/${section.slug}/${s.slug}`}
              className={`group py-10 transition-colors duration-700 hover:bg-ivory/[0.02] md:py-14 ${dir === "Next" ? "border-t border-line md:border-l md:border-t-0 md:pl-10 md:text-right" : "md:pr-10"}`}
            >
              <span className="eyebrow">{dir === "Next" ? "Next subject →" : "← Previous subject"}</span>
              <span className="mt-4 block font-display text-3xl font-light uppercase transition-colors duration-500 group-hover:text-bronze-300 md:text-4xl">
                {s.name}
              </span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
