import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FileQuestion, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { SubjectIcon } from "@/components/ui/SubjectIcon";
import { sectionTheme, subjectTheme } from "@/lib/palette";
import { getArchiveIndex, getPyqCountsBySubject, getSections, getSubjectBySlug, getSubjects, resourceCount, trackableKeys } from "@/lib/data/public";
import { cn } from "@/lib/utils";

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
    description: `${subject.name}: notes, slides and PYQs for every exam.`,
    alternates: { canonical: `/subjects/${subject.slug}` },
  };
}

/** One subject across every exam. */
export default async function SubjectHubPage({ params }: { params: Promise<Params> }) {
  const { subject: slug } = await params;
  const [subject, sections, index, pyqCounts] = await Promise.all([getSubjectBySlug(slug), getSections(), getArchiveIndex(), getPyqCountsBySubject()]);
  if (!subject) notFound();
  const keys = trackableKeys(index, { subjectId: subject.id });
  const pyqCount = pyqCounts[subject.id] ?? 0;
  const t = subjectTheme(subject.slug);

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/archive", label: "Study Material" }, { label: subject.name }]}
        tint={cn("from-white via-white", t.soft.replace("bg-", "to-"))}
        icon={<SubjectIcon slug={subject.slug} size="lg" className="hidden sm:inline-grid" />}
        title={subject.name}
        subtitle="Choose an exam to open this subject's notes and question papers."
        aside={
          <div className="card space-y-4 p-4">
            <ProgressBar keys={keys} label="Your progress" size="sm" fill={t.solid} />
            <Link href={`/pyqs?subject=${subject.slug}`} className="btn-luxe w-full">
              <FileQuestion className="h-5 w-5 text-orange-500" /> {pyqCount > 0 ? `Solve ${pyqCount} PYQs` : "Go to PYQs"}
            </Link>
          </div>
        }
      />
      <div className="frame py-10">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Exams</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((section) => {
            const sKeys = trackableKeys(index, { sectionId: section.id, subjectId: subject.id });
            const count = resourceCount(index, { sectionId: section.id, subjectId: subject.id });
            const st = sectionTheme(section.slug);
            return (
              <li key={section.id}>
                <Link href={`/archive/${section.slug}/${subject.slug}`} className={cn("card card-hover group flex h-full flex-col gap-4 p-5", count === 0 && "opacity-75")}>
                  <div className="flex items-start justify-between">
                    <span className={cn("grid h-11 w-11 place-items-center rounded-xl", st.soft, st.text)}>
                      <GraduationCap className="h-6 w-6" />
                    </span>
                    {sKeys.length > 0 && <ProgressRing keys={sKeys} size={44} label={`${section.name} progress`} color={t.hex} />}
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold text-slate-900">{section.name}</p>
                    <p className="text-[15px] text-slate-500">{count ? `${count} files` : "Nothing added yet"}</p>
                  </div>
                  {count > 0 && (
                    <span className={cn("mt-auto inline-flex items-center gap-1.5 text-[15px] font-semibold", t.text)}>
                      Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
