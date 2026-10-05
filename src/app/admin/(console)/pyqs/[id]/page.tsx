import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAllChapters, getAllResourcesLite, getOne, getPyqRelatedIds, getTaxonomy } from "@/lib/data/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PyqForm } from "@/components/admin/PyqForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { Pyq } from "@/types";

export const metadata = { title: "Edit PYQ" };

export default async function EditPyqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [pyq, relatedIds, { sections, subjects }, chapters, resources, topicsRes] = await Promise.all([
    getOne<Pyq>(supabase, "pyqs", id),
    getPyqRelatedIds(supabase, id),
    getTaxonomy(supabase),
    getAllChapters(supabase),
    getAllResourcesLite(supabase),
    supabase.from("pyqs").select("topic"),
  ]);
  if (!pyq) notFound();
  const topics = [...new Set(((topicsRes.data ?? []) as { topic: string | null }[]).map((t) => t.topic).filter((t): t is string => Boolean(t)))].sort();
  return (
    <>
      <AdminPageHeader eyebrow="PYQs" title="Edit question" description={`${pyq.year} · ${pyq.exam}${pyq.question_number ? ` · Q${pyq.question_number}` : ""}`} />
      <PyqForm pyq={pyq} relatedIds={relatedIds} sections={sections} subjects={subjects} chapters={chapters} resources={resources} topics={topics} />
      <div className="mt-16 max-w-5xl border-t border-line pt-8">
        <DeleteButton table="pyqs" id={pyq.id} label="Delete this question" />
      </div>
    </>
  );
}
