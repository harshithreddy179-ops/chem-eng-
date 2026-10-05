"use client";

import { useProgress } from "@/hooks/use-progress";
import { cn } from "@/lib/utils";

/** Inline "54% complete" text that tracks local progress. */
export function ProgressStat({ keys, className, suffix = "Complete" }: { keys: readonly string[]; className?: string; suffix?: string }) {
  const { percent, total, hydrated } = useProgress(keys);
  if (total === 0) return <span className={className}>Not yet tracked</span>;
  return (
    <span className={cn("tabular", className)}>
      {hydrated ? percent : "·"}% {suffix}
    </span>
  );
}
