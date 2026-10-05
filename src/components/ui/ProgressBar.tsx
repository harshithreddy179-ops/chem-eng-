"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useProgress } from "@/hooks/use-progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  keys: readonly string[];
  label?: string;
  size?: "sm" | "lg";
  className?: string;
  /** Show "x / y completed" under the bar. */
  showCount?: boolean;
}

/** Hairline progress bar with an oversized serif percentage. */
export function ProgressBar({ keys, label = "Your progress", size = "lg", className, showCount = true }: ProgressBarProps) {
  const { done, total, percent, hydrated } = useProgress(keys);
  const reduce = useReducedMotion();
  const empty = total === 0;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end justify-between gap-6">
        <span className="eyebrow">{label}</span>
        <span
          className={cn(
            "font-display font-light tabular leading-none",
            size === "lg" ? "text-6xl md:text-7xl" : "text-3xl",
          )}
          aria-hidden
        >
          {empty ? "—" : hydrated ? percent : "·"}
          {!empty && <span className="ml-1 align-top text-[0.4em] text-ivory-300">%</span>}
        </span>
      </div>
      <div
        className={cn("relative mt-5 w-full bg-ivory/10", size === "lg" ? "h-px" : "h-px")}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={empty ? "Nothing to track yet" : `${percent}% — ${done} of ${total} completed`}
      >
        <motion.div
          className="absolute inset-y-0 left-0 bg-bronze"
          style={{ height: size === "lg" ? 2 : 1, top: size === "lg" ? -0.5 : 0 }}
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ duration: reduce ? 0 : 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      {showCount && (
        <p className="mt-3 font-sans text-xs uppercase tracking-[0.2em] text-ivory-400 tabular">
          {empty ? "Nothing to track yet" : `${hydrated ? done : 0} / ${total} completed`}
        </p>
      )}
    </div>
  );
}
