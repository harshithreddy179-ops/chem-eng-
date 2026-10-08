"use client";

import { useEffect, useId, useState } from "react";
import { ChevronDown, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface SolutionRevealProps {
  children?: React.ReactNode;
  correctAnswer?: string | null;
  hasSolution: boolean;
  /** Reset to hidden whenever this key changes (practice mode). */
  resetKey?: string;
  className?: string;
}

/** "Show solution" toggle. */
export function SolutionReveal({ children, correctAnswer, hasSolution, resetKey, className }: SolutionRevealProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  useEffect(() => setOpen(false), [resetKey]);

  if (!hasSolution && !correctAnswer) {
    return (
      <div className={cn("flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3.5 text-[15px] text-slate-600", className)}>
        <Lightbulb className="h-5 w-5 shrink-0 text-amber-500" />
        Solution not added yet. Use the related notes to check your answer.
      </div>
    );
  }

  return (
    <div className={cn("min-w-0 overflow-hidden rounded-2xl border", open ? "border-emerald-200" : "border-slate-200", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className={cn("flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition", open ? "bg-emerald-50" : "bg-white hover:bg-slate-50")}
      >
        <span className="flex items-center gap-3">
          <span className={cn("grid h-10 w-10 place-items-center rounded-xl", open ? "bg-emerald-500 text-white" : "bg-amber-50 text-amber-600")}>
            <Lightbulb className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-[17px] font-bold text-slate-900">{open ? "Hide solution" : "Show solution"}</span>
            <span className="block text-sm text-slate-500">{open ? "Solution below" : "Try it yourself first"}</span>
          </span>
        </span>
        <ChevronDown className={cn("h-5 w-5 text-slate-500 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div id={id} role="region" aria-label="Solution" className="min-w-0 border-t border-emerald-100 bg-white px-4 py-5 sm:px-5 sm:py-6">
          {correctAnswer && (
            <p className="mb-5 flex flex-wrap items-baseline gap-3">
              <span className="chip bg-emerald-100 text-emerald-700">Answer</span>
              <span className="text-xl font-semibold text-slate-900">{correctAnswer}</span>
            </p>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
