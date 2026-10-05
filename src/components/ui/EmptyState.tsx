import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  message: string;
  index?: string;
  className?: string;
  compact?: boolean;
  children?: React.ReactNode;
}

/** A considered "nothing here yet" — architectural, never apologetic. */
export function EmptyState({ title, message, index = "—", className, compact, children }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-line",
        compact ? "px-6 py-10 md:px-8" : "px-6 py-20 md:px-14 md:py-28",
        className,
      )}
      role="status"
    >
      {/* drafting marks */}
      <span aria-hidden className="absolute left-0 top-0 h-4 w-4 border-l border-t border-bronze/60" />
      <span aria-hidden className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-bronze/60" />
      <svg aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 text-ivory/[0.05]" viewBox="0 0 200 200">
        {Array.from({ length: 6 }, (_, i) => (
          <circle key={i} cx="100" cy="100" r={20 + i * 16} fill="none" stroke="currentColor" />
        ))}
      </svg>
      <div className="relative max-w-xl">
        <span className="eyebrow tabular text-bronze">{index}</span>
        <h3
          className={cn(
            "mt-5 font-display font-light uppercase leading-[0.95] tracking-[-0.01em]",
            compact ? "text-2xl md:text-3xl" : "text-4xl md:text-6xl",
          )}
        >
          {title}
        </h3>
        <p className={cn("mt-5 font-display italic text-ivory-300", compact ? "text-lg" : "text-xl md:text-2xl")}>
          {message}
        </p>
        {children && <div className="mt-8">{children}</div>}
      </div>
    </div>
  );
}
