import { requireAdmin } from "@/lib/auth";
import { getTaxonomy } from "@/lib/data/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";

export const metadata = { title: "Academic sections" };

export default async function AdminSectionsPage() {
  const { supabase } = await requireAdmin();
  const { sections } = await getTaxonomy(supabase);
  return (
    <>
      <AdminPageHeader
        eyebrow="Configuration"
        title="Academic sections"
        description="Midsems and semesters. Rename, reorder, add, or disable a section to hide it publicly."
      />
      <TaxonomyManager kind="academic_sections" rows={sections} noun="section" />
    </>
  );
}
