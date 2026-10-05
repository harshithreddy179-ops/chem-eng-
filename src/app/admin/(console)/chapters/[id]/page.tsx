import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getOne, getTaxonomy } from "@/lib/data/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ChapterForm } from "@/components/admin/ChapterForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { Chapter } from "@/types";

export const metadata = { title: "Edit chapter" };

export default async function EditChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [chapter, { sections, subjects }] = await Promise.all([getOne<Chapter>(supabase, "chapters", id), getTaxonomy(supabase)]);
  if (!chapter) notFound();
  return (
    <>
      <AdminPageHeader eyebrow="Chapters" title="Edit chapter" description={chapter.name} />
      <ChapterForm chapter={chapter} sections={sections} subjects={subjects} />
      <div className="mt-16 max-w-5xl border-t border-line pt-8">
        <DeleteButton table="chapters" id={chapter.id} label="Delete this chapter" />
        <p className="mt-2 font-sans text-xs text-ivory-500">Resources linked to it are kept; they simply lose the chapter link.</p>
      </div>
    </>
  );
}
