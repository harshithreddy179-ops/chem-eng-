"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

interface SolutionRevealProps {
  children?: React.ReactNode;
  correctAnswer?: string | null;
  hasSolution: boolean;
  /** Reset to hidden whenever this key changes (practice mode). */
  resetKey?: string;
  className?: string;
}

/** "Solve it physically" — then a slow curtain-lift onto the solution. */
export function SolutionReveal({ children, correctAnswer, hasSolution, resetKey, className }: SolutionRevealProps) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const id = useId();

  useEffect(() => setOpen(false), [resetKey]);

  if (!hasSolution && !correctAnswer) {
    return (
      <div className={cn("border-t border-line pt-8", className)}>
        <p className="font-display text-xl italic text-ivory-400">A worked solution has not been added for this question yet.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className={cn(
          "group relative flex w-full items-center justify-between overflow-hidden border px-7 py-7 text-left transition-colors duration-700 ease-luxe md:px-10 md:py-9",
          open ? "border-bronze/50 bg-bronze/[0.06]" : "border-ivory/20 hover:border-bronze",
        )}
      >
        <span
          aria-hidden
          className="absolute inset-0 origin-left scale-x-0 bg-ivory/[0.03] transition-transform duration-1000 ease-luxe group-hover:scale-x-100"
        />
        <span className="relative">
          <span className="block font-sans text-[0.62rem] uppercase tracking-[0.3em] text-ivory-400">
            {open ? "Solution" : "Solved it on paper?"}
          </span>
          <span className="mt-2 block font-display text-3xl font-light uppercase md:text-4xl">
            {open ? "Hide solution" : "Reveal solution"}
          </span>
        </span>
        <span
          aria-hidden
          className={cn(
            "relative grid h-12 w-12 place-items-center border border-ivory/25 font-sans text-lg transition-transform duration-700 ease-luxe",
            open && "rotate-45 border-bronze text-bronze",
          )}
        >
          +
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            role="region"
            aria-label="Solution"
            key="solution"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: reduce ? 0 : 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: reduce ? 0.15 : 1.1, delay: reduce ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="border-x border-b border-line px-7 py-10 md:px-10 md:py-12"
            >
              {correctAnswer && (
                <p className="mb-8 flex items-baseline gap-4">
                  <span className="font-sans text-[0.62rem] uppercase tracking-[0.3em] text-bronze">Answer</span>
                  <span className="font-display text-2xl text-ivory">{correctAnswer}</span>
                </p>
              )}
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
