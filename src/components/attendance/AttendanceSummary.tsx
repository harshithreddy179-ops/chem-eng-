"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CourseStats } from "@/lib/attendance/engine";
import { allowance, formatPercent, percentOf } from "@/lib/attendance/engine";
import type { AttendanceCourse } from "@/types/attendance";
import { cn, pad } from "@/lib/utils";

export function allowanceText(stats: CourseStats | { attended: number; held: number; remaining: number }, target: number, name?: string) {
  const a = allowance(stats, target, stats.remaining);
  const subject = name ? ` ${name}` : "";
  if (a.kind === "no-data") return "Nothing recorded yet.";
  if (a.kind === "can-miss")
    return a.classes === 0
      ? `Right at the line — missing the next${subject} class drops you below ${target}%.`
      : `You can miss ${a.classes} more${subject} ${a.classes === 1 ? "class" : "classes"} and stay at or above ${target}%.`;
  if (!a.reachable)
    return Number.isFinite(a.classes)
      ? `Below ${target}%. Even attending every remaining class (${stats.remaining}) won't reach it this semester.`
      : `Below ${target}%.`;
  return `Below ${target}%. Attend the next ${a.classes}${subject} ${a.classes === 1 ? "class" : "classes"} in a row to get back to ${target}%.`;
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
  const reduce = useReducedMotion();
  return (
    <ol className="border-t border-line">
      {courses.map((c, i) => {
        const s = stats.get(c.id)!;
        const p = percentOf(s);
        const below = p != null && p + 1e-9 < target;
        return (
          <li key={c.id} className="grid gap-x-8 gap-y-4 border-b border-line py-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-5">
              <p className="font-sans text-[0.6rem] uppercase tracking-[0.26em] text-bronze">
                {pad(i + 1)} {c.code && <span className="text-ivory-500">· {c.code}</span>}
              </p>
              <h3 className="mt-3 font-display text-3xl font-light uppercase leading-[0.95] md:text-4xl">{c.name}</h3>
            </div>
            <div className="md:col-span-2">
              <p className={cn("font-display text-5xl font-light leading-none tabular", below ? "text-garnet-300" : "text-ivory")}>
                {formatPercent(p)}
                {p != null && <span className="text-xl text-ivory-500">%</span>}
              </p>
            </div>
            <div className="md:col-span-5">
              <p className="font-sans text-[0.62rem] uppercase tracking-[0.2em] text-ivory-400 tabular">
                {s.attended} attended · {s.held} held
                {s.baseline.held > 0 && <span className="text-ivory-500"> · incl. {s.baseline.attended}/{s.baseline.held} from notice</span>}
              </p>
              <div className="relative mt-4 h-px w-full bg-ivory/10" role="img" aria-label={`${formatPercent(p)}% against a ${target}% target`}>
                <motion.span
                  className={cn("absolute -top-px left-0 h-[3px]", below ? "bg-garnet" : "bg-bronze")}
                  initial={false}
                  animate={{ width: `${Math.min(100, p ?? 0)}%` }}
                  transition={{ duration: reduce ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}
                />
                <span aria-hidden className="absolute -top-2 h-5 w-px bg-ivory/50" style={{ left: `${target}%` }} />
              </div>
              <p className="mt-4 font-display text-lg italic leading-snug text-ivory-300">{allowanceText(s, target)}</p>
              {s.unmarked > 0 && (
                <p className="mt-1 font-sans text-[0.58rem] uppercase tracking-[0.2em] text-ivory-500">
                  {s.unmarked} past {s.unmarked === 1 ? "class" : "classes"} not marked
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
