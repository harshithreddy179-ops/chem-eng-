"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PyqNavItem } from "@/lib/pyq-order";
import { cn } from "@/lib/utils";

interface Props {
  prev: PyqNavItem | null;
  next: PyqNavItem | null;
  position: number;
  total: number;
  subjectName?: string;
}

function paper(item: PyqNavItem) {
  return [item.year, item.section_name ?? item.exam].join(" · ");
}

/** Previous / next question in the same subject. ← and → keys work too. */
export function PyqNav({ prev, next, position, total, subjectName }: Props) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const target = e.key === "ArrowLeft" ? prev : e.key === "ArrowRight" ? next : null;
      if (target) router.push(`/pyqs/${target.id}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, router]);

  if (total < 2 || position === 0) return null;

  return (
    <nav aria-label="Question navigation" className="card p-4">
      <div className="mb-3 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-slate-700">
          Question {position} of {total}
          {subjectName && <span className="font-normal text-slate-500"> in {subjectName}</span>}
        </span>
        <span className="hidden text-slate-400 sm:inline">Tip: use ← → keys</span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand-600" style={{ width: `${(position / total) * 100}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <NavButton item={prev} dir="prev" />
        <NavButton item={next} dir="next" />
      </div>
    </nav>
  );
}

function NavButton({ item, dir }: { item: PyqNavItem | null; dir: "prev" | "next" }) {
  const isNext = dir === "next";
  const label = isNext ? "Next question" : "Previous question";
  const base = cn("flex items-center gap-3 rounded-xl px-4 py-3", isNext ? "flex-row-reverse text-right" : "");

  if (!item) {
    return (
      <div className={cn(base, "border border-dashed border-slate-200 text-slate-400")} aria-hidden>
        {isNext ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
        <span className="text-[15px] font-semibold">{isNext ? "Last question" : "First question"}</span>
      </div>
    );
  }

  return (
    <Link
      href={`/pyqs/${item.id}`}
      rel={dir}
      aria-label={`${label}: ${item.question_number ? `Q${item.question_number}, ` : ""}${paper(item)}`}
      className={cn(base, "transition", isNext ? "bg-brand-600 text-white hover:bg-brand-700" : "border border-slate-200 bg-white text-slate-800 hover:border-brand-300 hover:bg-brand-50")}
    >
      {isNext ? <ArrowRight className="h-5 w-5 shrink-0" /> : <ArrowLeft className="h-5 w-5 shrink-0" />}
      <span className="min-w-0">
        <span className="block text-[15px] font-bold">{label}</span>
        <span className={cn("block truncate text-sm", isNext ? "text-white/80" : "text-slate-500")}>
          Q{item.question_number ?? "–"} · {paper(item)}
        </span>
      </span>
    </Link>
  );
}
