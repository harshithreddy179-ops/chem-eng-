import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAllChapters, getTaxonomy, listResources } from "@/lib/data/admin";
import { AdminPageHeader, SavedNotice } from "@/components/admin/AdminPageHeader";
import { AdminTable, StatusDot } from "@/components/admin/AdminTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { RESOURCE_CATEGORIES, RESOURCE_TYPE_LABEL } from "@/lib/constants";

export const metadata = { title: "Resources" };

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function AdminResourcesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ sections, subjects }, resources, chapters] = await Promise.all([
    getTaxonomy(supabase),
    listResources(supabase, sp),
    getAllChapters(supabase),
  ]);
  const sectionName = new Map(sections.map((s) => [s.id, s.name]));
  const subjectName = new Map(subjects.map((s) => [s.id, s.name]));
  const chapterName = new Map(chapters.map((c) => [c.id, c.name]));
  const categoryLabel = Object.fromEntries(RESOURCE_CATEGORIES.map((c) => [c.value, c.label]));

  return (
    <>
      <AdminPageHeader
        eyebrow="Content"
        title="Resources"
        description="Google Drive links, placed by section, subject and category."
        action={{ href: "/admin/resources/new", label: "+ Add resource" }}
      />
      <SavedNotice saved={sp.saved} />
      <FilterBar
        action="/admin/resources"
        sections={sections}
        subjects={subjects}
        values={sp}
        extra={
          <label className="block">
            <span className="field-label">Category</span>
            <select name="category" defaultValue={sp.category ?? ""} className="field">
              <option value="">All categories</option>
              {RESOURCE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        }
      />
      <AdminTable
        columns={[{ label: "Title" }, { label: "Placement" }, { label: "Type" }, { label: "Order", className: "w-16" }, { label: "Status" }, { label: "", className: "w-32 text-right" }]}
        empty={<p className="border-t border-line py-10 font-display text-xl italic text-ivory-500">No resources match. Add one to begin.</p>}
        rows={resources.map((r) => ({
          key: r.id,
          cells: [
            <div key="t">
              <Link href={`/admin/resources/${r.id}`} className="text-ivory hover:text-bronze-300">
                {r.label ? `${r.label} — ` : ""}
                {r.title}
              </Link>
              {r.chapter_id && <p className="mt-1 text-xs text-ivory-500">{chapterName.get(r.chapter_id)}</p>}
            </div>,
            <div key="p" className="text-xs leading-relaxed text-ivory-400">
              {sectionName.get(r.section_id)}
              <br />
              {subjectName.get(r.subject_id)} · {categoryLabel[r.category]}
            </div>,
            <span key="ty" className="text-xs uppercase tracking-wider text-ivory-400">{RESOURCE_TYPE_LABEL[r.resource_type]}</span>,
            <span key="o" className="tabular text-ivory-400">{r.display_order}</span>,
            <StatusDot key="s" on={r.is_published} />,
            <div key="a" className="flex items-center justify-end gap-4">
              <a href={r.drive_url} target="_blank" rel="noopener noreferrer" className="text-[0.65rem] uppercase tracking-[0.2em] text-ivory-400 hover:text-ivory">
                Open ↗
              </a>
              <DeleteButton table="resources" id={r.id} />
            </div>,
          ],
        }))}
      />
    </>
  );
}
