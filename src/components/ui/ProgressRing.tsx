"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useProgress } from "@/hooks/use-progress";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  keys: readonly string[];
  size?: number;
  stroke?: number;
  className?: string;
  label?: string;
}

/** Compact circular progress, used in lists. */
export function ProgressRing({ keys, size = 44, stroke = 1.5, className, label = "Progress" }: ProgressRingProps) {
  const { percent, total, done, hydrated } = useProgress(keys);
  const reduce = useReducedMotion();
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={total ? `${label}: ${percent}% (${done} of ${total})` : `${label}: nothing to track yet`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(236 230 218 / 0.12)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#b39469"
          strokeWidth={stroke}
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c - (c * percent) / 100 }}
          transition={{ duration: reduce ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <span className="absolute font-sans text-[0.6rem] tabular tracking-wider text-ivory-200" aria-hidden>
        {total === 0 ? "—" : hydrated ? `${percent}` : "·"}
      </span>
    </div>
  );
}
