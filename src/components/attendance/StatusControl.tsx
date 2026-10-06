"use client";

import { Ban, Check, X } from "lucide-react";
import type { MarkStatus } from "@/types/attendance";
import { cn } from "@/lib/utils";

const OPTIONS: { value: MarkStatus; label: string; icon: typeof Check; on: string; off: string }[] = [
  { value: "present", label: "Present", icon: Check, on: "border-emerald-500 bg-emerald-500 text-white", off: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400" },
  { value: "absent", label: "Absent", icon: X, on: "border-rose-500 bg-rose-500 text-white", off: "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-400" },
  { value: "cancelled", label: "Cancelled", icon: Ban, on: "border-slate-500 bg-slate-500 text-white", off: "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-400" },
];

/** Present / Absent / Cancelled buttons. Tapping the chosen one again clears it. */
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
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-3 gap-2">
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
              "flex items-center justify-center gap-1.5 rounded-xl border-2 px-2 py-2.5 text-sm font-bold transition",
              active ? o.on : o.off,
              active && planned && "opacity-70",
            )}
          >
            <o.icon className="h-4 w-4" strokeWidth={2.5} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
