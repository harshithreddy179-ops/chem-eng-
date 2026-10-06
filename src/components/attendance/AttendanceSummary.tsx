"use client";

import type { CourseStats } from "@/lib/attendance/engine";
import { allowance, formatPercent, percentOf } from "@/lib/attendance/engine";
import type { AttendanceCourse } from "@/types/attendance";
import { cn } from "@/lib/utils";

export function allowanceText(stats: CourseStats | { attended: number; held: number; remaining: number }, target: number, name?: string) {
  const a = allowance(stats, target, stats.remaining);
  const subject = name ? ` ${name}` : "";
  if (a.kind === "no-data") return "No classes marked yet.";
  if (a.kind === "can-miss")
    return a.classes === 0
      ? `You are just at ${target}%. Don't miss the next${subject} class.`
      : `You can miss ${a.classes} more${subject} ${a.classes === 1 ? "class" : "classes"} and still stay above ${target}%.`;
  if (!a.reachable)
    return Number.isFinite(a.classes)
      ? `Below ${target}%. Even if you attend all ${stats.remaining} remaining classes, you can't reach ${target}% this semester.`
      : `Below ${target}%.`;
  return `Below ${target}%. Attend the next ${a.classes}${subject} ${a.classes === 1 ? "class" : "classes"} to get back to ${target}%.`;
}

export function AttendanceSummary({
  courses,
  stats,
  target,
}: {
  courses: AttendanceCourse[];
  stats: Map<string, CourseStats>;
  target: number;
}) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {courses.map((c) => {
        const s = stats.get(c.id)!;
        const p = percentOf(s);
        const below = p != null && p + 1e-9 < target;
        const tone = p == null ? "text-slate-400" : below ? "text-rose-600" : "text-emerald-600";
        return (
          <li key={c.id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {c.code && <p className="text-sm font-semibold text-slate-500">{c.code}</p>}
                <h3 className="text-lg font-bold leading-snug text-slate-900">{c.name}</h3>
              </div>
              <p className={cn("shrink-0 text-3xl font-bold leading-none tabular", tone)}>
                {formatPercent(p)}
                {p != null && <span className="text-lg">%</span>}
              </p>
            </div>
            <div className="relative mt-4 h-2.5 w-full rounded-full bg-slate-100" role="img" aria-label={`${formatPercent(p)}% against a ${target}% target`}>
              <span
                className={cn("absolute inset-y-0 left-0 rounded-full transition-[width] duration-700", below ? "bg-rose-500" : "bg-emerald-500")}
                style={{ width: `${Math.min(100, p ?? 0)}%` }}
              />
              <span aria-hidden className="absolute -top-1 h-[18px] w-0.5 rounded bg-slate-700" style={{ left: `${target}%` }} title={`${target}% target`} />
            </div>
            <p className="mt-2 text-sm text-slate-500 tabular">
              {s.attended} attended of {s.held} classes
              {s.baseline.held > 0 && <> · includes {s.baseline.attended}/{s.baseline.held} from notice</>}
            </p>
            <p className={cn("mt-3 rounded-xl px-3 py-2 text-[15px] font-medium", p == null ? "bg-slate-50 text-slate-600" : below ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800")}>
              {allowanceText(s, target)}
            </p>
            {s.unmarked > 0 && (
              <p className="mt-2 text-sm font-medium text-amber-700">
                {s.unmarked} past {s.unmarked === 1 ? "class" : "classes"} not marked
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
