"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { SolutionReveal } from "./SolutionReveal";
import { pad, cn } from "@/lib/utils";

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

/** A calm, one-question-at-a-time practice run. Self-assessed — never auto-graded. */
export function PracticeSession({ items, restartHref }: { items: PracticeItem[]; restartHref: string }) {
  const reduce = useReducedMotion();
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
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [index, finished, reduce]);

  if (finished) {
    const solved = items.filter((q) => marks[q.id] === "solved").length;
    const review = items.filter((q) => marks[q.id] === "review");
    return (
      <motion.section
        initial={{ opacity: 0, y: reduce ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Session summary"
      >
        <p className="eyebrow text-bronze">Session complete</p>
        <h2 className="mt-8 font-display text-display-lg font-light uppercase">
          {solved} <span className="italic text-ivory-400">of</span> {total}
        </h2>
        <p className="mt-4 font-display text-2xl italic text-ivory-300">marked as solved on paper.</p>
        {review.length > 0 && (
          <div className="mt-16">
            <p className="eyebrow">Worth another look</p>
            <ul className="mt-5 border-t border-line">
              {review.map((q) => (
                <li key={q.id} className="border-b border-line">
                  <Link href={`/pyqs/${q.id}`} className="group flex items-center justify-between gap-6 py-5">
                    <span className="font-display text-xl text-ivory">{q.title}</span>
                    <span aria-hidden className="text-ivory-400 transition-transform duration-500 group-hover:translate-x-1 group-hover:text-bronze">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-16 flex flex-wrap gap-5">
          <button
            type="button"
            className="btn-solid"
            onClick={() => {
              setIndex(0);
              setMarks({});
              setFinished(false);
            }}
          >
            Go again
          </button>
          <Link href={restartHref} className="btn-luxe">
            New session
          </Link>
        </div>
      </motion.section>
    );
  }

  return (
    <div>
      {/* Session rail */}
      <div className="sticky top-[4.5rem] z-20 -mx-5 border-b border-line bg-ink/85 px-5 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8 md:top-20 lg:-mx-14 lg:px-14">
        <div className="flex items-center justify-between gap-6">
          <p className="font-sans text-[0.65rem] uppercase tracking-[0.3em] text-ivory-300" aria-live="polite">
            Question <span className="tabular text-ivory">{pad(index + 1)}</span> / <span className="tabular">{pad(total)}</span>
          </p>
          <div className="flex flex-1 justify-end gap-1.5" aria-hidden>
            {items.map((q, i) => (
              <span
                key={q.id}
                className={cn(
                  "h-px max-w-10 flex-1 transition-colors duration-700",
                  i === index ? "bg-ivory" : marks[q.id] === "solved" ? "bg-bronze" : marks[q.id] === "review" ? "bg-ivory/40" : "bg-ivory/10",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: reduce ? 0 : 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: reduce ? 0 : -30 }}
          transition={{ duration: reduce ? 0.15 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-16 pt-14 lg:grid-cols-12"
        >
          <div className="lg:col-span-8">
            {item.statement}
            <p className="mt-14 font-display text-xl italic text-ivory-400">Solve it physically.</p>
            <SolutionReveal className="mt-8" hasSolution={item.hasSolution} correctAnswer={item.correctAnswer} resetKey={item.id}>
              {item.solution}
            </SolutionReveal>

            <fieldset className="mt-12">
              <legend className="eyebrow mb-4">How did it go?</legend>
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    ["solved", "I solved it"],
                    ["review", "Needs review"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={marks[item.id] === value}
                    onClick={() => setMarks((m) => ({ ...m, [item.id]: value }))}
                    className={cn(
                      "border px-5 py-3 font-sans text-[0.65rem] uppercase tracking-[0.24em] transition-colors duration-500",
                      marks[item.id] === value ? "border-bronze bg-bronze/15 text-ivory" : "border-line text-ivory-400 hover:border-ivory/30 hover:text-ivory",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="lg:col-span-4 lg:pt-40">{item.related}</div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-20 flex items-center justify-between gap-6 border-t border-line pt-8">
        <button type="button" onClick={prev} disabled={index === 0} className="link-luxe text-ivory-400 disabled:opacity-30">
          ← Previous
        </button>
        <button type="button" onClick={next} className="btn-solid">
          {index === total - 1 ? "Finish session" : "Next question →"}
        </button>
      </div>
      <p className="mt-6 text-right font-sans text-[0.6rem] uppercase tracking-[0.2em] text-ivory-500">← → keys to move</p>
    </div>
  );
}
