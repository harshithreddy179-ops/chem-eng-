import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getTaxonomy, listPyqs } from "@/lib/data/admin";
import { AdminPageHeader, SavedNotice } from "@/components/admin/AdminPageHeader";
import { AdminTable, StatusDot } from "@/components/admin/AdminTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { plainPreview } from "@/components/pyq/MathText";

export const metadata = { title: "PYQs" };

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function AdminPyqsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ sections, subjects }, pyqs] = await Promise.all([getTaxonomy(supabase), listPyqs(supabase, sp)]);
  const sectionName = new Map(sections.map((s) => [s.id, s.name]));
  const subjectName = new Map(subjects.map((s) => [s.id, s.name]));

  return (
    <>
      <AdminPageHeader eyebrow="Content" title="PYQs" description="Individual previous-year questions with solutions." action={{ href: "/admin/pyqs/new", label: "+ Add PYQ" }} />
      <SavedNotice saved={sp.saved} />
      <FilterBar action="/admin/pyqs" sections={sections} subjects={subjects} values={sp} />
      <AdminTable
        columns={[{ label: "Question" }, { label: "Paper" }, { label: "Topic" }, { label: "Status" }, { label: "", className: "w-28 text-right" }]}
        empty={<p className="border-t border-line py-10 font-display text-xl text-ivory-500">No questions match. Add one to begin.</p>}
        rows={pyqs.map((q) => ({
          key: q.id,
          cells: [
            <Link key="q" href={`/admin/pyqs/${q.id}`} className="line-clamp-2 max-w-md text-ivory hover:text-bronze-300">
              {q.question_number ? `Q${q.question_number}. ` : ""}
              {plainPreview(q.question, 110)}
            </Link>,
            <div key="p" className="text-xs leading-relaxed text-ivory-400">
              {subjectName.get(q.subject_id)}
              <br />
              {q.year} · {q.exam}
              {q.section_id ? ` · ${sectionName.get(q.section_id)}` : ""}
            </div>,
            <span key="t" className="text-xs text-ivory-400">
              {q.topic ?? "—"}
              {q.difficulty ? ` · ${q.difficulty}` : ""}
            </span>,
            <StatusDot key="s" on={q.is_published} />,
            <div key="a" className="flex items-center justify-end gap-4">
              {q.is_published && (
                <Link href={`/pyqs/${q.id}`} target="_blank" className="text-sm text-ivory-400 hover:text-ivory">
                  View ↗
                </Link>
              )}
              <DeleteButton table="pyqs" id={q.id} />
            </div>,
          ],
        }))}
      />
    </>
  );
}
