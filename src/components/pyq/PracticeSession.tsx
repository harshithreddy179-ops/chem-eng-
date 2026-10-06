"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Trophy, X } from "lucide-react";
import { SolutionReveal } from "./SolutionReveal";
import { cn } from "@/lib/utils";

export interface PracticeItem {
  id: string;
  statement: React.ReactNode;
  solution: React.ReactNode;
  related: React.ReactNode;
  hasSolution: boolean;
  correctAnswer: string | null;
  title: string;
}

type Mark = "solved" | "review";

/** One question at a time. You mark yourself — nothing is auto-graded. */
export function PracticeSession({ items, restartHref }: { items: PracticeItem[]; restartHref: string }) {
  const [index, setIndex] = useState(0);
  const [marks, setMarks] = useState<Record<string, Mark>>({});
  const [finished, setFinished] = useState(false);
  const total = items.length;
  const item = items[index];

  const next = useCallback(() => {
    if (index < total - 1) setIndex((i) => i + 1);
    else setFinished(true);
  }, [index, total]);
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select")) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [index, finished]);

  const solved = items.filter((q) => marks[q.id] === "solved").length;
  const review = items.filter((q) => marks[q.id] === "review");

  if (finished) {
    const pct = Math.round((solved / total) * 100);
    return (
      <section aria-label="Practice result" className="mx-auto max-w-2xl">
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-r from-brand-600 to-violet-600 px-6 py-8 text-center text-white">
            <Trophy className="mx-auto h-10 w-10" />
            <h2 className="mt-3 font-display text-4xl font-bold">Practice complete!</h2>
            <p className="mt-1 text-white/85">Here&rsquo;s how you did</p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-line text-center">
            <Stat label="Got right" value={solved} tone="text-emerald-600" />
            <Stat label="To revise" value={review.length} tone="text-rose-600" />
            <Stat label="Score" value={`${pct}%`} tone="text-brand-600" />
          </div>
        </div>
        {review.length > 0 && (
          <div className="card mt-5 p-5">
            <p className="text-lg font-bold text-slate-900">Revise these questions</p>
            <ul className="mt-3 space-y-2">
              {review.map((q) => (
                <li key={q.id}>
                  <Link href={`/pyqs/${q.id}`} className="flex items-center justify-between gap-4 rounded-xl border border-line p-3 font-semibold text-slate-800 hover:border-brand-200 hover:bg-brand-50/50">
                    {q.title}
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-solid"
            onClick={() => {
              setIndex(0);
              setMarks({});
              setFinished(false);
            }}
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
          <Link href={restartHref} className="btn-luxe">
            New practice set
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-5 lg:col-span-8">
        <div className="card flex items-center gap-4 p-4">
          <span className="text-[15px] font-bold text-slate-900" aria-live="polite">
            Question {index + 1} of {total}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${((index + 1) / total) * 100}%` }} />
          </div>
        </div>

        <div key={item.id} className="space-y-5">
          {item.statement}
          <SolutionReveal hasSolution={item.hasSolution} correctAnswer={item.correctAnswer} resetKey={item.id}>
            {item.solution}
          </SolutionReveal>

          <fieldset className="card p-4">
            <legend className="sr-only">How did it go?</legend>
            <p className="mb-3 text-[15px] font-semibold text-slate-700">Did you get it right?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                aria-pressed={marks[item.id] === "solved"}
                onClick={() => setMarks((m) => ({ ...m, [item.id]: "solved" }))}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-[15px] font-bold transition",
                  marks[item.id] === "solved" ? "border-emerald-500 bg-emerald-500 text-white" : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400",
                )}
              >
                <Check className="h-5 w-5" /> Yes, solved it
              </button>
              <button
                type="button"
                aria-pressed={marks[item.id] === "review"}
                onClick={() => setMarks((m) => ({ ...m, [item.id]: "review" }))}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-[15px] font-bold transition",
                  marks[item.id] === "review" ? "border-rose-500 bg-rose-500 text-white" : "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-400",
                )}
              >
                <X className="h-5 w-5" /> No, need to revise
              </button>
            </div>
          </fieldset>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={prev} disabled={index === 0} className="btn-luxe">
            <ArrowLeft className="h-4 w-4" /> Previous
          </button>
          <button type="button" onClick={next} className="btn-solid">
            {index === total - 1 ? "Finish" : "Next question"} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-5 lg:col-span-4">
        <div className="card p-4">
          <p className="text-[15px] font-bold text-slate-900">All questions</p>
          <ol className="mt-3 grid grid-cols-6 gap-2">
            {items.map((q, i) => (
              <li key={q.id}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to question ${i + 1}`}
                  aria-current={i === index ? "step" : undefined}
                  className={cn(
                    "grid h-10 w-full place-items-center rounded-lg text-sm font-bold transition",
                    i === index
                      ? "bg-brand-600 text-white"
                      : marks[q.id] === "solved"
                        ? "bg-emerald-100 text-emerald-700"
                        : marks[q.id] === "review"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                  )}
                >
                  {i + 1}
                </button>
              </li>
            ))}
          </ol>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Solved</span>
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Revise</span>
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Not marked</span>
          </p>
        </div>
        {item.related}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone: string }) {
  return (
    <div className="px-3 py-5">
      <p className={cn("text-3xl font-bold tabular", tone)}>{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}
