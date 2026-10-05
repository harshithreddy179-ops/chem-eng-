import { requireAdmin } from "@/lib/auth";
import { getTaxonomy } from "@/lib/data/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ChapterForm } from "@/components/admin/ChapterForm";

export const metadata = { title: "Add chapter" };

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function NewChapterPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { sections, subjects } = await getTaxonomy(supabase);
  return (
    <>
      <AdminPageHeader eyebrow="Chapters" title="Add chapter" />
      <ChapterForm sections={sections} subjects={subjects} defaults={sp} />
    </>
  );
}
