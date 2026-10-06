"use client";

import { useMemo, useState } from "react";
import type { CourseStats } from "@/lib/attendance/engine";
import { monthName, weekday, weekdayShort } from "@/lib/attendance/dates";
import type { AttendanceCourse, ISODate } from "@/types/attendance";
import { cn } from "@/lib/utils";

const SYMBOL = {
  present: { label: "Present", cls: "bg-emerald-50 text-emerald-700" },
  absent: { label: "Absent", cls: "bg-rose-50 text-rose-700" },
  cancelled: { label: "Cancelled", cls: "bg-slate-100 text-slate-600" },
  "dept-cancelled": { label: "Cancelled by dept.", cls: "bg-slate-100 text-slate-600" },
  unmarked: { label: "Not marked", cls: "bg-amber-50 text-amber-700" },
} as const;

export function AttendanceHistory({
  courses,
  stats,
  onOpen,
}: {
  courses: AttendanceCourse[];
  stats: Map<string, CourseStats>;
  onOpen: (date: ISODate) => void;
}) {
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const months = useMemo(() => {
    const history = stats.get(courseId)?.history ?? [];
    const groups = new Map<string, typeof history>();
    for (const h of [...history].reverse()) {
      const m = h.date.slice(0, 7);
      groups.set(m, [...(groups.get(m) ?? []), h]);
    }
    return [...groups.entries()];
  }, [stats, courseId]);

  return (
    <div className="card grid gap-6 p-4 md:grid-cols-12 md:p-5">
      <div className="md:col-span-4">
        <label className="block">
          <span className="field-label">Choose subject</span>
          <select className="field" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="max-h-[32rem] overflow-y-auto md:col-span-8">
        {months.length === 0 ? (
          <p className="py-4 text-[15px] text-slate-500">No classes yet for this subject.</p>
        ) : (
          months.map(([m, rows]) => (
            <section key={m} className="mb-6" aria-label={`${monthName(m)} ${m.slice(0, 4)}`}>
              <h3 className="mb-2 text-[15px] font-bold text-slate-900">
                {monthName(m)} {m.slice(0, 4)}
              </h3>
              <ul className="divide-y divide-line rounded-xl border border-line">
                {rows.map((h) => {
                  const sym = SYMBOL[h.status];
                  return (
                    <li key={h.key}>
                      <button type="button" onClick={() => onOpen(h.date)} className="flex w-full items-center gap-4 px-3 py-2.5 text-left transition hover:bg-slate-50">
                        <span className="w-9 text-lg font-bold tabular text-slate-900">{h.date.slice(8)}</span>
                        <span className="w-10 text-sm font-medium text-slate-500">{weekdayShort(weekday(h.date))}</span>
                        <span className="w-14 text-sm tabular text-slate-500">{h.start}</span>
                        <span className={cn("chip ml-auto", sym.cls)}>{sym.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
