import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, FileQuestion, FolderOpen, ListChecks, Target } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SubjectIcon } from "@/components/ui/SubjectIcon";
import { ResourceList } from "@/components/archive/ResourceList";
import { ChapterChecklist } from "@/components/archive/ChapterChecklist";
import { PYQCard } from "@/components/pyq/PYQCard";
import { subjectTheme } from "@/lib/palette";
import { chapterPyqCounts, getSectionBySlug, getSections, getSubjectBySlug, getSubjectContent, getSubjects } from "@/lib/data/public";
import type { ProgressKey } from "@/types";
import { cn } from "@/lib/utils";

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
    description: `${subject.name} for ${section.name}: lecture slides, notes and previous year questions.`,
    alternates: { canonical: `/archive/${section.slug}/${subject.slug}` },
  };
}

export default async function SubjectPage({ params }: { params: Promise<Params> }) {
  const { section: sectionSlug, subject: subjectSlug } = await params;
  const [section, subject, subjects] = await Promise.all([getSectionBySlug(sectionSlug), getSubjectBySlug(subjectSlug), getSubjects()]);
  if (!section || !subject) notFound();

  const content = await getSubjectContent(section.id, subject.id);
  const { chapters, resources, pyqs } = content;
  const lectures = resources.filter((r) => r.category === "lecture");
  const pyqResources = resources.filter((r) => r.category === "pyq");
  const others = resources.filter((r) => r.category === "other");
  const t = subjectTheme(subject.slug);

  const keys: ProgressKey[] = resources.filter((r) => r.is_trackable).map((r) => `resource:${r.id}` as const);

  const position = subjects.findIndex((s) => s.id === subject.id);
  const next = subjects[(position + 1) % subjects.length];
  const prev = subjects[(position - 1 + subjects.length) % subjects.length];

  const jump = [
    chapters.length > 0 && { href: "#chapters", label: "Chapters", icon: ListChecks, n: chapters.length },
    { href: "#lectures-title-section", label: "Notes & Slides", icon: BookOpen, n: lectures.length },
    { href: "#pyqs-title-section", label: "Question Papers", icon: FolderOpen, n: pyqResources.length },
    pyqs.length > 0 && { href: "#questions", label: "PYQs", icon: FileQuestion, n: pyqs.length },
  ].filter(Boolean) as { href: string; label: string; icon: typeof BookOpen; n: number }[];

  return (
    <>
      <PageHeader
        crumbs={[
          { href: "/archive", label: "Study Material" },
          { href: `/archive/${section.slug}`, label: section.name },
          { label: subject.name },
        ]}
        tint={cn("from-white via-white", t.soft.replace("bg-", "to-"))}
        icon={<SubjectIcon slug={subject.slug} size="lg" className="hidden sm:inline-grid" />}
        title={subject.name}
        subtitle={`${section.name} · ${chapters.length} chapters · ${resources.length} files`}
        aside={
          <div className="card p-4">
            <ProgressBar keys={keys} label="Your progress" size="sm" fill={t.solid} />
          </div>
        }
      />

      {/* Jump bar */}
      <nav aria-label="On this page" className="sticky top-16 z-30 border-b border-line bg-white/95 backdrop-blur md:top-[7.25rem] lg:top-[4.5rem]">
        <div className="frame flex gap-2 overflow-x-auto py-3 scrollbar-none">
          {jump.map((j) => (
            <a key={j.href} href={j.href} className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-[15px] font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700">
              <j.icon className="h-4 w-4" /> {j.label}
              <span className="rounded-full bg-slate-100 px-2 text-xs text-slate-600">{j.n}</span>
            </a>
          ))}
        </div>
      </nav>

      <div className="frame space-y-12 py-10">
        {chapters.length > 0 && (
          <section id="chapters" aria-labelledby="chapters-title" className="scroll-mt-40">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 id="chapters-title" className="flex items-center gap-2.5 text-xl font-bold text-slate-900">
                <ListChecks className={cn("h-6 w-6", t.text)} /> Chapters
              </h2>
              <span className="text-sm text-slate-500">PYQs asked from each chapter</span>
            </div>
            <ChapterChecklist chapters={chapters} resources={resources} pyqCounts={chapterPyqCounts(content)} examLabel={section.name} />
          </section>
        )}

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          <ResourceList
            id="lectures-title"
            title="Notes & Slides"
            icon={<BookOpen className="h-6 w-6 text-brand-600" />}
            resources={lectures}
            chapters={chapters}
            emptyTitle="No notes yet"
            emptyMessage="Lecture slides and notes will show up here."
          />
          <ResourceList
            id="pyqs-title"
            title="Question Papers"
            icon={<FolderOpen className="h-6 w-6 text-violet-600" />}
            resources={pyqResources}
            chapters={chapters}
            emptyTitle="No papers yet"
            emptyMessage="Past exam papers will show up here."
          />
        </div>

        {others.length > 0 && (
          <ResourceList id="others-title" title="More Files" resources={others} chapters={chapters} emptyTitle="" emptyMessage="" />
        )}

        {pyqs.length > 0 && (
          <section id="questions" aria-labelledby="vault-title" className="scroll-mt-40">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 id="vault-title" className="flex items-center gap-2.5 text-xl font-bold text-slate-900">
                <FileQuestion className="h-6 w-6 text-orange-500" /> Previous Year Questions
              </h2>
              <Link href={`/pyqs/practice?subject=${subject.slug}&section=${section.slug}&start=1`} className="btn-solid px-4 py-2.5 text-sm">
                <Target className="h-4 w-4" /> Practice these
              </Link>
            </div>
            <ul className="grid gap-3 md:grid-cols-2">
              {pyqs.slice(0, 12).map((q) => (
                <li key={q.id}>
                  <PYQCard pyq={q} />
                </li>
              ))}
            </ul>
            {pyqs.length > 12 && (
              <Link href={`/pyqs?subject=${subject.slug}&section=${section.slug}`} className="link-luxe mt-5">
                See all {pyqs.length} questions <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </section>
        )}

        {subjects.length > 1 && (
          <nav aria-label="Other subjects" className="grid gap-3 sm:grid-cols-2">
            {[
              { s: prev, dir: "Previous subject", Icon: ArrowLeft },
              { s: next, dir: "Next subject", Icon: ArrowRight },
            ].map(({ s, dir, Icon }) => (
              <Link
                key={dir}
                href={`/archive/${section.slug}/${s.slug}`}
                className={cn("card card-hover flex items-center gap-4 p-4", dir.startsWith("Next") && "sm:flex-row-reverse sm:text-right")}
              >
                <Icon className="h-5 w-5 shrink-0 text-slate-400" />
                <SubjectIcon slug={s.slug} size="sm" />
                <span className="min-w-0">
                  <span className="block text-sm text-slate-500">{dir}</span>
                  <span className="block truncate font-semibold text-slate-900">{s.name}</span>
                </span>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
