"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useHydrated, useItemProgress } from "@/hooks/use-progress";
import { cn } from "@/lib/utils";

interface CompletionCheckboxProps {
  progressKey: string;
  label: string;
  className?: string;
  /** Visually show the word "Completed" next to the box. */
  showText?: boolean;
}

/** An accessible, bespoke checkbox that writes to personal progress. */
export function CompletionCheckbox({ progressKey, label, className, showText = true }: CompletionCheckboxProps) {
  const [done, setDone] = useItemProgress(progressKey);
  const hydrated = useHydrated();
  const reduce = useReducedMotion();
  const checked = hydrated && done;

  return (
    <label
      className={cn(
        "group/check relative inline-flex cursor-pointer select-none items-center gap-3 py-2",
        className,
      )}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => setDone(e.target.checked)}
        aria-label={`Mark “${label}” as completed`}
      />
      <span
        aria-hidden
        className={cn(
          "relative grid h-[18px] w-[18px] place-items-center border transition-colors duration-500 ease-luxe peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-bronze",
          checked ? "border-bronze bg-bronze" : "border-ivory/35 group-hover/check:border-ivory/70",
        )}
      >
        <svg viewBox="0 0 16 16" className="h-3 w-3">
          <motion.path
            d="M3 8.5 6.5 12 13 4.5"
            fill="none"
            stroke="#0d0c0b"
            strokeWidth="1.8"
            initial={false}
            animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
            transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
      </span>
      {showText && (
        <span
          className={cn(
            "font-sans text-[0.65rem] uppercase tracking-[0.24em] transition-colors duration-500",
            checked ? "text-bronze-300" : "text-ivory-400 group-hover/check:text-ivory-200",
          )}
        >
          {checked ? "Completed" : "Mark complete"}
        </span>
      )}
    </label>
  );
}
