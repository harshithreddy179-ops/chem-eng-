import { requireAdmin } from "@/lib/auth";
import { getAllChapters, getAllResourcesLite, getTaxonomy } from "@/lib/data/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PyqForm } from "@/components/admin/PyqForm";

export const metadata = { title: "Add PYQ" };

export default async function NewPyqPage() {
  const { supabase } = await requireAdmin();
  const [{ sections, subjects }, chapters, resources, topicsRes] = await Promise.all([
    getTaxonomy(supabase),
    getAllChapters(supabase),
    getAllResourcesLite(supabase),
    supabase.from("pyqs").select("topic"),
  ]);
  const topics = [...new Set(((topicsRes.data ?? []) as { topic: string | null }[]).map((t) => t.topic).filter((t): t is string => Boolean(t)))].sort();
  return (
    <>
      <AdminPageHeader eyebrow="PYQs" title="Add question" description="No auto-grading — students solve on paper and reveal your solution." />
      <PyqForm sections={sections} subjects={subjects} chapters={chapters} resources={resources} topics={topics} />
    </>
  );
}
