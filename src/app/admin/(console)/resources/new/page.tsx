import { requireAdmin } from "@/lib/auth";
import { getAllChapters, getTaxonomy } from "@/lib/data/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ResourceForm } from "@/components/admin/ResourceForm";

export const metadata = { title: "Add resource" };

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function NewResourcePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ sections, subjects }, chapters] = await Promise.all([getTaxonomy(supabase), getAllChapters(supabase)]);
  return (
    <>
      <AdminPageHeader eyebrow="Resources" title="Add resource" description="It becomes available publicly the moment you save." />
      <ResourceForm sections={sections} subjects={subjects} chapters={chapters} defaults={sp} />
    </>
  );
}
