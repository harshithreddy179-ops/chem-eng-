import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getTaxonomy } from "@/lib/data/admin";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusDot } from "@/components/admin/AdminTable";
import { NewSemester } from "@/components/admin/attendance/NewSemester";
import { semesterFields } from "@/components/admin/attendance/fields";
import { formatShort } from "@/lib/attendance/dates";
import type { AttendanceSemester } from "@/types/attendance";

export const metadata = { title: "Attendance" };

export default async function AdminAttendancePage() {
  const { supabase } = await requireAdmin();
  const [{ data }, { sections }] = await Promise.all([
    supabase.from("attendance_semesters").select("*").order("display_order").order("start_date", { ascending: false }),
    getTaxonomy(supabase),
  ]);
  const semesters = (data ?? []) as AttendanceSemester[];

  return (
    <>
      <AdminPageHeader
        eyebrow="Tools"
        title="Attendance"
        description="Semester dates, the weekly timetable, holidays and changes. Students' own marks stay on their devices."
      />
      {semesters.length === 0 ? (
        <p className="border-t border-line py-8 font-display text-xl italic text-ivory-500">No semesters yet — add the first one below.</p>
      ) : (
        <ul className="border-t border-line">
          {semesters.map((s) => (
            <li key={s.id} className="border-b border-line">
              <Link href={`/admin/attendance/${s.id}`} className="flex flex-wrap items-center justify-between gap-4 py-5 hover:text-bronze-300">
                <span>
                  <span className="block font-display text-2xl font-light">
                    {s.name} · {s.academic_year}
                  </span>
                  <span className="font-sans text-[0.62rem] uppercase tracking-[0.2em] text-ivory-500">
                    {s.group_label ? `${s.group_label} · ` : ""}
                    {formatShort(s.start_date)} {s.start_date.slice(0, 4)} – {formatShort(s.end_date)} {s.end_date.slice(0, 4)}
                  </span>
                </span>
                <StatusDot on={s.is_published} />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <NewSemester fields={semesterFields(sections)} />
    </>
  );
}
