import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs({ items, className }: { items: { href?: string; label: string }[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className ?? "mb-5"}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-slate-500">
        <li>
          <Link href="/" className="flex items-center gap-1 rounded-md px-1 py-0.5 hover:text-brand-600" aria-label="Home">
            <Home className="h-4 w-4" />
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            <ChevronRight aria-hidden className="h-4 w-4 text-slate-300" />
            {item.href ? (
              <Link href={item.href} className="rounded-md px-1 py-0.5 hover:text-brand-600">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="px-1 font-semibold text-slate-800">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
