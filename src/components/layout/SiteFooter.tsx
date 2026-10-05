import Link from "next/link";
import { INSTITUTION, NAV_LINKS, SITE_TAGLINE } from "@/lib/constants";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-32 border-t border-line">
      <div className="frame grid gap-16 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-7">
          <p className="eyebrow">{INSTITUTION} · Department of Chemical Engineering</p>
          <p className="mt-8 font-display text-display-md font-light uppercase">
            The Chemical
            <br />
            Archive
          </p>
          <p className="mt-6 max-w-md font-display text-xl italic text-ivory-300">{SITE_TAGLINE}</p>
        </div>
        <nav aria-label="Footer" className="md:col-span-4 md:col-start-9">
          <p className="eyebrow mb-6">Index</p>
          <ul className="divide-y divide-line border-y border-line">
            {[{ href: "/", label: "Home" }, ...NAV_LINKS, { href: "/pyqs/practice", label: "Practice" }].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="group flex items-center justify-between py-4 font-sans text-xs uppercase tracking-[0.24em] text-ivory-300 transition-colors duration-500 hover:text-ivory"
                >
                  {l.label}
                  <span aria-hidden className="translate-x-0 transition-transform duration-500 ease-luxe group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="frame flex flex-col gap-3 border-t border-line py-8 font-sans text-[0.65rem] uppercase tracking-[0.24em] text-ivory-500 md:flex-row md:justify-between">
        <span>© {year} The Chemical Archive</span>
        <span>Files open in Google Drive · Progress is saved on this device</span>
      </div>
    </footer>
  );
}
