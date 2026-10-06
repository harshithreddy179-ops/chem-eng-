"use client";

import { useProgress } from "@/hooks/use-progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  keys: readonly string[];
  label?: string;
  size?: "sm" | "lg";
  className?: string;
  /** Show "x of y done" under the bar. */
  showCount?: boolean;
  /** Tailwind bg class for the filled part. */
  fill?: string;
}

/** Rounded progress bar with a percentage. */
export function ProgressBar({ keys, label = "Your progress", size = "lg", className, showCount = true, fill = "bg-brand-600" }: ProgressBarProps) {
  const { done, total, percent, hydrated } = useProgress(keys);
  const empty = total === 0;
  const shown = hydrated ? percent : 0;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end justify-between gap-4">
        <span className={cn("font-semibold text-slate-700", size === "lg" ? "text-[15px]" : "text-sm")}>{label}</span>
        <span className={cn("font-bold tabular text-slate-900", size === "lg" ? "text-3xl" : "text-base")} aria-hidden>
          {empty ? "–" : `${shown}%`}
        </span>
      </div>
      <div
        className={cn("mt-2 w-full overflow-hidden rounded-full bg-slate-100", size === "lg" ? "h-3" : "h-2")}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={empty ? "Nothing to track yet" : `${percent}%: ${done} of ${total} done`}
      >
        <div className={cn("h-full rounded-full transition-[width] duration-700 ease-out", fill)} style={{ width: `${shown}%` }} />
      </div>
      {showCount && (
        <p className="mt-2 text-sm text-slate-500 tabular">
          {empty ? "Nothing to track yet" : `${hydrated ? done : 0} of ${total} done`}
        </p>
      )}
    </div>
  );
}
