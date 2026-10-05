"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { Subject } from "@/types";
import { pad, cn } from "@/lib/utils";

interface SubjectListProps {
  subjects: Subject[];
  /** Pre-rendered motifs keyed by slug (server-rendered SVG). */
  motifs: Record<string, React.ReactNode>;
}

/** Editorial index of subjects with a sticky, cross-fading visual. */
export function SubjectList({ subjects, motifs }: SubjectListProps) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const current = subjects[active];

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
      <ol className="border-t border-line lg:col-span-7">
        {subjects.map((s, i) => (
          <li key={s.id} className="border-b border-line">
            <Link
              href={`/subjects/${s.slug}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className="group relative flex items-baseline gap-4 py-7 md:gap-10 md:py-9"
            >
              <span
                className={cn(
                  "w-8 shrink-0 font-sans text-xs tabular tracking-[0.2em] transition-colors duration-700",
                  active === i ? "text-bronze" : "text-ivory-500",
                )}
              >
                {pad(i + 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block font-display text-[1.6rem] font-light uppercase leading-[0.95] tracking-[-0.01em] transition-all duration-1000 ease-luxe sm:text-5xl lg:text-[3.4rem]",
                    active === i ? "translate-x-2 text-ivory" : "text-ivory/45 group-hover:text-ivory/80",
                  )}
                >
                  {s.name}
                </span>
                {s.description && (
                  <span
                    className={cn(
                      "mt-3 block max-w-md font-display text-lg italic text-ivory-300 transition-all duration-700 ease-luxe lg:hidden",
                    )}
                  >
                    {s.description}
                  </span>
                )}
              </span>
              <span
                aria-hidden
                className={cn(
                  "hidden shrink-0 font-sans text-sm transition-all duration-700 ease-luxe md:block",
                  active === i ? "translate-x-0 text-bronze opacity-100" : "-translate-x-2 opacity-0",
                )}
              >
                →
              </span>
              {/* Mobile motif */}
              <span aria-hidden className="hidden h-14 w-16 shrink-0 self-center text-bronze/70 sm:block lg:hidden">
                {motifs[s.slug]}
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <div className="hidden lg:col-span-4 lg:col-start-9 lg:block">
        <div className="sticky top-28">
          <div className="relative aspect-[4/5] overflow-hidden border border-line bg-ink-800">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(179,148,105,0.14),transparent_60%)]" />
            <AnimatePresence mode="wait">
              {current && (
                <motion.div
                  key={current.slug}
                  className="absolute inset-0 p-10 text-ivory/70"
                  initial={{ opacity: 0, scale: reduce ? 1 : 1.06, filter: reduce ? "none" : "blur(6px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: reduce ? 1 : 0.98 }}
                  transition={{ duration: reduce ? 0.2 : 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex h-full flex-col justify-between">
                    <span className="font-sans text-xs tabular tracking-[0.3em] text-bronze">{pad(active + 1)} / {pad(subjects.length)}</span>
                    <div className="mx-auto w-full max-w-[85%] text-ivory/60">{motifs[current.slug]}</div>
                    <p className="font-display text-xl italic leading-snug text-ivory-200">{current.description}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="grain pointer-events-none absolute inset-0 overflow-hidden" />
          </div>
        </div>
      </div>
    </div>
  );
}
