import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Target } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { QuestionViewer } from "@/components/pyq/QuestionViewer";
import { PyqNav } from "@/components/pyq/PyqNav";
import { plainPreview } from "@/components/pyq/MathText";
import { getPyqById, getPyqNeighbours } from "@/lib/data/public";

export const revalidate = 300;

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const pyq = await getPyqById(id);
  if (!pyq) return { title: "Question not found" };
  return {
    title: `${pyq.subject?.name ?? "PYQ"} · ${pyq.year} ${pyq.exam}${pyq.question_number ? ` · Q${pyq.question_number}` : ""}`,
    description: plainPreview(pyq.question, 155),
    alternates: { canonical: `/pyqs/${pyq.id}` },
  };
}

export default async function PyqPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const pyq = await getPyqById(id);
  if (!pyq) notFound();
  const nav = await getPyqNeighbours(pyq);
  const back = pyq.subject ? `/pyqs?subject=${pyq.subject.slug}` : "/pyqs";

  return (
    <div className="bg-page">
      <div className="frame py-6 md:py-8">
        <Breadcrumbs
          items={[
            { href: "/pyqs", label: "PYQs" },
            ...(pyq.subject ? [{ href: back, label: pyq.subject.name }] : []),
            { label: `${pyq.year} · Q${pyq.question_number ?? ""}` },
          ]}
        />
        <QuestionViewer pyq={pyq} nav={<PyqNav {...nav} subjectName={pyq.subject?.name} />} />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Link href={back} className="btn-luxe">
            <ArrowLeft className="h-4 w-4" /> Back to all questions
          </Link>
          <Link
            href={`/pyqs/practice?${new URLSearchParams({ ...(pyq.subject ? { subject: pyq.subject.slug } : {}), ...(pyq.topic ? { topic: pyq.topic } : {}) })}`}
            className="btn-solid"
          >
            <Target className="h-4 w-4" /> Practice similar questions
          </Link>
        </div>
      </div>
    </div>
  );
}
