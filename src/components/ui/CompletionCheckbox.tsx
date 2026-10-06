"use client";

import { Check } from "lucide-react";
import { useHydrated, useItemProgress } from "@/hooks/use-progress";
import { cn } from "@/lib/utils";

interface CompletionCheckboxProps {
  progressKey: string;
  label: string;
  className?: string;
  /** Show "Done" / "Mark as done" next to the box. */
  showText?: boolean;
}

/** Checkbox that saves "done" to this device's progress. */
export function CompletionCheckbox({ progressKey, label, className, showText = true }: CompletionCheckboxProps) {
  const [done, setDone] = useItemProgress(progressKey);
  const hydrated = useHydrated();
  const checked = hydrated && done;

  return (
    <label
      className={cn(
        "inline-flex cursor-pointer select-none items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
        checked ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
        className,
      )}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => setDone(e.target.checked)}
        aria-label={`Mark “${label}” as done`}
      />
      <span
        aria-hidden
        className={cn(
          "grid h-5 w-5 place-items-center rounded-md border-2 transition peer-focus-visible:ring-4 peer-focus-visible:ring-brand-100",
          checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white",
        )}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      {showText && <span>{checked ? "Done" : "Mark as done"}</span>}
    </label>
  );
}
