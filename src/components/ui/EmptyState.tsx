import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  message: string;
  /** Kept for older call sites; not shown. */
  index?: string;
  className?: string;
  compact?: boolean;
  children?: React.ReactNode;
}

/** Friendly "nothing here yet" box. */
export function EmptyState({ title, message, className, compact, children }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 text-center",
        compact ? "px-6 py-8" : "px-6 py-14",
        className,
      )}
      role="status"
    >
      <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-slate-400 shadow-sm">
        <Inbox className="h-6 w-6" />
      </span>
      <h3 className={cn("mt-4 font-bold text-slate-800", compact ? "text-lg" : "text-xl")}>{title}</h3>
      <p className="mt-1 max-w-md text-[15px] text-slate-500">{message}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
