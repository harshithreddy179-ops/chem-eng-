import Link from "next/link";
import { INSTITUTION, SITE_TAGLINE } from "@/lib/constants";
import { TOOLS } from "@/lib/tools";

const COLUMNS = [
  {
    title: "Study",
    links: [
      { href: "/archive", label: "Study Material" },
      { href: "/archive/midsem-1", label: "Midsem 1" },
      { href: "/archive/semester-1", label: "Semester 1" },
    ],
  },
  {
    title: "PYQs",
    links: [
      { href: "/pyqs", label: "All PYQs" },
      { href: "/pyqs/practice", label: "Practice" },
    ],
  },
  {
    title: "Tools",
    links: TOOLS.filter((t) => t.status === "available").map((t) => ({ href: `/tools/${t.slug}`, label: t.name })),
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-line bg-page pb-24 md:pb-0">
      <div className="frame grid gap-10 py-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-display text-2xl font-bold text-slate-900">The Chemical Archive</p>
          <p className="mt-1 text-[15px] font-medium text-slate-500">{INSTITUTION} · Department of Chemical Engineering</p>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-slate-600">{SITE_TAGLINE}</p>
        </div>
        {COLUMNS.map((c) => (
          <nav key={c.title} aria-label={c.title} className="md:col-span-2">
            <p className="text-sm font-bold text-slate-900">{c.title}</p>
            <ul className="mt-3 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[15px] text-slate-600 transition-colors hover:text-brand-600">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="frame flex flex-col gap-2 border-t border-line py-6 text-sm text-slate-500 md:flex-row md:justify-between">
        <span>© {year} The Chemical Archive</span>
        <span>Files open in Google Drive · Your progress is saved on this device</span>
      </div>
    </footer>
  );
}
