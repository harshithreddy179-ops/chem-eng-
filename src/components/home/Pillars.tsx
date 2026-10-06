import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";

const PILLARS = [
  {
    numeral: "I",
    title: "The Archive",
    line: "Everything you need to study.",
    body: "Lecture decks, chapter notes and study material — sorted by exam and by subject, opened straight from Google Drive.",
    href: "/archive",
    cta: "Enter the archive",
  },
  {
    numeral: "II",
    title: "The PYQ Vault",
    line: "Previous-year questions, organised for practice.",
    body: "Browse by year, exam, topic and difficulty. Solve on paper, then reveal the solution — and follow it back to the lecture it came from.",
    href: "/pyqs",
    cta: "Open the vault",
  },
  {
    numeral: "III",
    title: "The Tools",
    line: "Simple tools for better study sessions.",
    body: "A focus timer, an attendance calendar that knows your timetable, and a scientific calculator on every page.",
    href: "/tools",
    cta: "See the tools",
  },
];

/** Three editorial rows — not three cards. */
export function Pillars() {
  return (
    <section className="frame py-28 md:py-40" aria-labelledby="pillars-title">
      <Reveal className="mb-16 flex items-center justify-between md:mb-24">
        <p id="pillars-title" className="eyebrow">
          <span className="text-bronze">02</span> &nbsp;— &nbsp;What lives here
        </p>
        <p className="eyebrow hidden md:block">Three rooms</p>
      </Reveal>

      <ol className="border-t border-line">
        {PILLARS.map((p, i) => (
          <Reveal as="li" key={p.title} delay={i * 0.08} className="border-b border-line">
            <Link
              href={p.href}
              className="group relative grid gap-6 py-12 transition-colors duration-700 md:grid-cols-12 md:items-baseline md:gap-8 md:py-16"
            >
              <span
                aria-hidden
                className="absolute inset-0 origin-left scale-x-0 bg-ivory/[0.025] transition-transform duration-1000 ease-luxe group-hover:scale-x-100"
              />
              <span className="relative font-display text-2xl italic text-bronze md:col-span-1">{p.numeral}</span>
              <h3 className="relative font-display text-display-md font-light uppercase transition-transform duration-1000 ease-luxe group-hover:translate-x-3 md:col-span-5">
                {p.title}
              </h3>
              <div className="relative md:col-span-4">
                <p className="font-display text-xl italic text-ivory-100">{p.line}</p>
                <p className="mt-3 font-sans text-sm leading-relaxed text-ivory-400">{p.body}</p>
              </div>
              <span className="relative flex items-center gap-3 font-sans text-[0.65rem] uppercase tracking-luxe text-ivory-300 transition-colors duration-500 group-hover:text-bronze-300 md:col-span-2 md:justify-end">
                {p.cta}
                <span aria-hidden className="transition-transform duration-700 ease-luxe group-hover:translate-x-1.5">→</span>
              </span>
            </Link>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
