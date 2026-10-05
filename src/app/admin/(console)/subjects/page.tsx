import { requireAdmin } from "@/lib/auth";
import { getTaxonomy } from "@/lib/data/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";

export const metadata = { title: "Subjects" };

export default async function AdminSubjectsPage() {
  const { supabase } = await requireAdmin();
  const { subjects } = await getTaxonomy(supabase);
  return (
    <>
      <AdminPageHeader eyebrow="Configuration" title="Subjects" description="Rename, reorder, enable or disable subjects. Disabled subjects disappear from the public site." />
      <TaxonomyManager kind="subjects" rows={subjects} noun="subject" />
    </>
  );
}
