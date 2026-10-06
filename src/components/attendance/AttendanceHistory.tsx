"use client";

import { useMemo, useState } from "react";
import type { CourseStats } from "@/lib/attendance/engine";
import { monthName, weekday, weekdayShort } from "@/lib/attendance/dates";
import type { AttendanceCourse, ISODate } from "@/types/attendance";
import { cn } from "@/lib/utils";

const SYMBOL = {
  present: { s: "✓", label: "Present", cls: "text-bronze-300" },
  absent: { s: "✕", label: "Absent", cls: "text-ivory" },
  cancelled: { s: "—", label: "Cancelled", cls: "text-ivory-500" },
  "dept-cancelled": { s: "—", label: "Cancelled by dept.", cls: "text-ivory-500" },
  unmarked: { s: "·", label: "Not marked", cls: "text-ivory-500" },
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
    <div className="grid gap-10 md:grid-cols-12">
      <div className="md:col-span-4">
        <label className="block">
          <span className="field-label">Subject</span>
          <select className="field" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="md:col-span-8">
        {months.length === 0 ? (
          <p className="border-t border-line pt-6 font-display text-xl italic text-ivory-400">No classes recorded yet for this subject.</p>
        ) : (
          months.map(([m, rows]) => (
            <section key={m} className="mb-10" aria-label={`${monthName(m)} ${m.slice(0, 4)}`}>
              <h3 className="eyebrow mb-3">
                {monthName(m)} <span className="text-ivory-500">{m.slice(0, 4)}</span>
              </h3>
              <ul className="border-t border-line">
                {rows.map((h) => {
                  const sym = SYMBOL[h.status];
                  return (
                    <li key={h.key} className="border-b border-line">
                      <button
                        type="button"
                        onClick={() => onOpen(h.date)}
                        className="flex w-full items-center gap-5 py-3 text-left transition-colors hover:bg-ivory/[0.02]"
                      >
                        <span className="w-14 font-display text-2xl tabular">{h.date.slice(8)}</span>
                        <span className="w-10 font-sans text-[0.6rem] uppercase tracking-[0.2em] text-ivory-500">{weekdayShort(weekday(h.date))}</span>
                        <span className="w-14 font-sans text-xs tabular text-ivory-500">{h.start}</span>
                        <span className={cn("flex items-center gap-3 font-sans text-[0.62rem] uppercase tracking-[0.22em]", sym.cls)}>
                          <span aria-hidden className="w-3 font-display text-base normal-case tracking-normal">{sym.s}</span>
                          {sym.label}
                        </span>
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
