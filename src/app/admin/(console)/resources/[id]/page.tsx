import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAllChapters, getOne, getTaxonomy } from "@/lib/data/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { Resource } from "@/types";

export const metadata = { title: "Edit resource" };

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [resource, { sections, subjects }, chapters] = await Promise.all([
    getOne<Resource>(supabase, "resources", id),
    getTaxonomy(supabase),
    getAllChapters(supabase),
  ]);
  if (!resource) notFound();
  return (
    <>
      <AdminPageHeader eyebrow="Resources" title="Edit resource" description={resource.title} />
      <ResourceForm resource={resource} sections={sections} subjects={subjects} chapters={chapters} />
      <div className="mt-16 max-w-5xl border-t border-line pt-8">
        <DeleteButton table="resources" id={resource.id} label="Delete this resource" />
      </div>
    </>
  );
}
