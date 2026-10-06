"use client";

import { useProgress } from "@/hooks/use-progress";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  keys: readonly string[];
  size?: number;
  stroke?: number;
  className?: string;
  label?: string;
  /** Stroke colour of the filled arc. */
  color?: string;
}

/** Compact circular progress, used in lists. */
export function ProgressRing({ keys, size = 48, stroke = 5, className, label = "Progress", color = "#2457e8" }: ProgressRingProps) {
  const { percent, total, done, hydrated } = useProgress(keys);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const shown = hydrated ? percent : 0;
  return (
    <div
      className={cn("relative inline-grid shrink-0 place-items-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={total ? `${label}: ${percent}% (${done} of ${total})` : `${label}: nothing to track yet`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e8edf5" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * shown) / 100}
          style={{ transition: "stroke-dashoffset 0.7s ease-out" }}
        />
      </svg>
      <span className="absolute text-xs font-bold tabular text-slate-700" aria-hidden>
        {total === 0 ? "–" : `${shown}%`}
      </span>
    </div>
  );
}
