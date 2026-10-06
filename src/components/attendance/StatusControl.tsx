"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";
import type { MarkStatus } from "@/types/attendance";
import { cn } from "@/lib/utils";

const OPTIONS: { value: MarkStatus; label: string; symbol: string }[] = [
  { value: "present", label: "Present", symbol: "✓" },
  { value: "absent", label: "Absent", symbol: "✕" },
  { value: "cancelled", label: "Cancelled", symbol: "—" },
];

/** Three-way segmented control. Choosing the active option again clears it. */
export function StatusControl({
  value,
  onChange,
  label,
  planned,
}: {
  value: MarkStatus | undefined;
  onChange: (v: MarkStatus | null) => void;
  label: string;
  planned?: boolean;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  return (
    <div role="radiogroup" aria-label={label} className="relative grid grid-cols-3 border border-line">
      {OPTIONS.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(active ? null : o.value)}
            className={cn(
              "relative z-10 flex items-center justify-center gap-2 px-2 py-3 font-sans text-[0.6rem] uppercase tracking-[0.2em] transition-colors duration-500 sm:text-[0.62rem]",
              active
                ? o.value === "present"
                  ? "text-ink"
                  : "text-ivory"
                : "text-ivory-400 hover:text-ivory",
            )}
          >
            {active && (
              <motion.span
                layoutId={`status-${id}`}
                className={cn(
                  "absolute inset-0 -z-10",
                  o.value === "present" && (planned ? "bg-bronze/60" : "bg-bronze"),
                  o.value === "absent" && "border border-ivory/60 bg-ivory/[0.08]",
                  o.value === "cancelled" && "bg-ivory/[0.06]",
                )}
                transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <span aria-hidden className="font-display text-sm normal-case tracking-normal">
              {o.symbol}
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
