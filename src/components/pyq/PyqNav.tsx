"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { PyqNavItem } from "@/lib/pyq-order";
import { cn, pad } from "@/lib/utils";

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

/** Previous / next question within the subject. ← and → keys work too. */
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
    <nav aria-label="Question navigation" className="mt-20">
      <p className="mb-4 font-sans text-[0.6rem] uppercase tracking-[0.26em] text-ivory-500">
        {subjectName ? `${subjectName} · ` : ""}Question {position} of {total}
      </p>
      <div className="grid grid-cols-2 border border-line">
        <NavCell item={prev} dir="prev" />
        <NavCell item={next} dir="next" />
      </div>
    </nav>
  );
}

function NavCell({ item, dir }: { item: PyqNavItem | null; dir: "prev" | "next" }) {
  const isNext = dir === "next";
  const base = cn("flex min-h-28 flex-col justify-between gap-4 p-5 sm:p-7", isNext ? "items-end border-l border-line text-right" : "items-start");
  const label = isNext ? "Next question →" : "← Previous question";

  if (!item) {
    return (
      <div className={cn(base, "opacity-30")} aria-hidden>
        <span className="font-sans text-[0.6rem] uppercase tracking-[0.26em] text-ivory-400">{label}</span>
        <span className="font-display text-lg italic text-ivory-500">{isNext ? "End of the vault" : "First question"}</span>
      </div>
    );
  }

  return (
    <Link
      href={`/pyqs/${item.id}`}
      rel={dir}
      aria-label={`${isNext ? "Next" : "Previous"} question: ${item.question_number ? `Q${item.question_number}, ` : ""}${paper(item)}`}
      className={cn(base, "group transition-colors duration-500 hover:bg-ivory/[0.03]")}
    >
      <span className="font-sans text-[0.6rem] uppercase tracking-[0.26em] text-ivory-400 transition-colors duration-500 group-hover:text-bronze-300">
        {label}
      </span>
      <span>
        <span className="block font-display text-3xl font-light leading-none md:text-4xl">
          Q<span className="italic text-ivory-300">{item.question_number ? pad(item.question_number) : "—"}</span>
        </span>
        <span className="mt-2 block font-sans text-[0.58rem] uppercase tracking-[0.22em] text-ivory-500">{paper(item)}</span>
      </span>
    </Link>
  );
}
