import { cn } from "@/lib/utils";

export interface Column {
  label: string;
  className?: string;
}

/** Minimal, hairline data table. Rows are pre-rendered cells. */
export function AdminTable({ columns, rows, empty }: { columns: Column[]; rows: { key: string; cells: React.ReactNode[] }[]; empty: React.ReactNode }) {
  if (rows.length === 0) return <>{empty}</>;
  return (
    <div className="overflow-x-auto border-t border-line">
      <table className="w-full min-w-[44rem] text-left">
        <thead>
          <tr className="border-b border-line">
            {columns.map((c) => (
              <th key={c.label} scope="col" className={cn("px-3 py-4 font-sans text-[0.6rem] font-normal uppercase tracking-[0.22em] text-ivory-500", c.className)}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-b border-line transition-colors hover:bg-ivory/[0.02]">
              {r.cells.map((cell, i) => (
                <td key={i} className={cn("px-3 py-4 align-top font-sans text-sm text-ivory-200", columns[i]?.className)}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatusDot({ on, labels = ["Published", "Hidden"] }: { on: boolean; labels?: [string, string] }) {
  return (
    <span className="inline-flex items-center gap-2 font-sans text-[0.62rem] uppercase tracking-[0.18em] text-ivory-400">
      <span className={cn("h-1.5 w-1.5 rounded-full", on ? "bg-bronze" : "bg-ivory/25")} aria-hidden />
      {on ? labels[0] : labels[1]}
    </span>
  );
}
