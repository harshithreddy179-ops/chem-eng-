import Link from "next/link";

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-12 md:mb-16">
      <ol className="flex flex-wrap items-center gap-3 font-sans text-[0.62rem] uppercase tracking-[0.26em] text-ivory-500">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-3">
            {i > 0 && <span aria-hidden className="h-px w-5 bg-ivory/20" />}
            {item.href ? (
              <Link href={item.href} className="transition-colors duration-500 hover:text-ivory">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ivory-300">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
