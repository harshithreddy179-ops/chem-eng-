import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getTaxonomy, listChapters } from "@/lib/data/admin";
import { AdminPageHeader, SavedNotice } from "@/components/admin/AdminPageHeader";
import { AdminTable, StatusDot } from "@/components/admin/AdminTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const metadata = { title: "Chapters" };

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function AdminChaptersPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ sections, subjects }, chapters] = await Promise.all([getTaxonomy(supabase), listChapters(supabase, sp)]);
  const sectionName = new Map(sections.map((s) => [s.id, s.name]));
  const subjectName = new Map(subjects.map((s) => [s.id, s.name]));

  return (
    <>
      <AdminPageHeader
        eyebrow="Content"
        title="Chapters"
        description="Chapters and topics — each gets a completion checkbox for students."
        action={{ href: `/admin/chapters/new${sp.section || sp.subject ? `?${new URLSearchParams({ ...(sp.section ? { section: sp.section } : {}), ...(sp.subject ? { subject: sp.subject } : {}) })}` : ""}`, label: "+ Add chapter" }}
      />
      <SavedNotice saved={sp.saved} />
      <FilterBar action="/admin/chapters" sections={sections} subjects={subjects} values={sp} />
      <AdminTable
        columns={[{ label: "Chapter" }, { label: "Section" }, { label: "Subject" }, { label: "Order", className: "w-16" }, { label: "Status" }, { label: "", className: "w-24 text-right" }]}
        empty={<p className="border-t border-line py-10 font-display text-xl text-ivory-500">No chapters match. Add one to begin.</p>}
        rows={chapters.map((c) => ({
          key: c.id,
          cells: [
            <Link key="n" href={`/admin/chapters/${c.id}`} className="text-ivory hover:text-bronze-300">
              {c.name}
            </Link>,
            <span key="se" className="text-xs text-ivory-400">{sectionName.get(c.section_id)}</span>,
            <span key="su" className="text-xs text-ivory-400">{subjectName.get(c.subject_id)}</span>,
            <span key="o" className="tabular text-ivory-400">{c.display_order}</span>,
            <StatusDot key="s" on={c.is_published} />,
            <div key="a" className="flex justify-end">
              <DeleteButton table="chapters" id={c.id} />
            </div>,
          ],
        }))}
      />
    </>
  );
}
