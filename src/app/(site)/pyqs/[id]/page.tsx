import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { QuestionViewer } from "@/components/pyq/QuestionViewer";
import { plainPreview } from "@/components/pyq/MathText";
import { getPyqById } from "@/lib/data/public";

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

  return (
    <div className="frame pb-10 pt-36 md:pt-44">
      <Breadcrumbs
        items={[
          { href: "/pyqs", label: "PYQ Vault" },
          ...(pyq.subject ? [{ href: `/pyqs?subject=${pyq.subject.slug}`, label: pyq.subject.name }] : []),
          { label: `${pyq.year} · ${pyq.exam}` },
        ]}
      />
      <QuestionViewer pyq={pyq} />
      <div className="mt-24 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-10">
        <Link href={pyq.subject ? `/pyqs?subject=${pyq.subject.slug}` : "/pyqs"} className="link-luxe text-ivory-300">
          ← Back to the vault
        </Link>
        <Link
          href={`/pyqs/practice?${new URLSearchParams({ ...(pyq.subject ? { subject: pyq.subject.slug } : {}), ...(pyq.topic ? { topic: pyq.topic } : {}) })}`}
          className="btn-luxe"
        >
          Practise similar questions →
        </Link>
      </div>
    </div>
  );
}
