import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { TOOLS } from "@/lib/tools";
import { pad } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tools",
  description: "Simple instruments for better study sessions — beginning with a Pomodoro focus timer.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  const available = TOOLS.filter((t) => t.status === "available");
  const planned = TOOLS.filter((t) => t.status === "planned");
  return (
    <div className="frame pb-10 pt-36 md:pt-48">
      <SectionHeading as="h1" size="xl" index="—" eyebrow="Instruments" title="Tools" lede="Simple tools for better study sessions." align="split" />

      <ol className="mt-20 border-t border-line md:mt-28">
        {available.map((tool, i) => (
          <Reveal as="li" key={tool.slug} className="border-b border-line">
            <Link href={`/tools/${tool.slug}`} className="group relative grid items-center gap-8 overflow-hidden py-14 md:grid-cols-12 md:py-20">
              <span aria-hidden className="absolute inset-0 origin-left scale-x-0 bg-ivory/[0.025] transition-transform duration-1000 ease-luxe group-hover:scale-x-100" />
              <span className="relative font-sans text-xs tabular tracking-[0.2em] text-bronze md:col-span-1">{pad(i + 1)}</span>
              <div className="relative md:col-span-6">
                <h2 className="font-display text-display-md font-light uppercase transition-transform duration-1000 ease-luxe group-hover:translate-x-3">
                  {tool.name}
                </h2>
                <p className="mt-4 max-w-md font-display text-xl italic text-ivory-300">{tool.summary}</p>
              </div>
              <div aria-hidden className="relative hidden md:col-span-3 md:col-start-9 md:block">
                <svg viewBox="0 0 100 100" className="mx-auto h-36 w-36 -rotate-90 text-ivory/20 transition-colors duration-1000 group-hover:text-bronze/70">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#b39469" strokeWidth="0.8" strokeDasharray="289" strokeDashoffset="72" className="transition-[stroke-dashoffset] duration-[1600ms] ease-luxe group-hover:[stroke-dashoffset:0]" />
                </svg>
              </div>
              <span className="relative flex items-center gap-3 font-sans text-[0.65rem] uppercase tracking-luxe text-ivory-200 transition-colors duration-500 group-hover:text-bronze-300 md:col-span-2 md:justify-end">
                Open <span aria-hidden className="transition-transform duration-700 group-hover:translate-x-1.5">→</span>
              </span>
            </Link>
          </Reveal>
        ))}
      </ol>

      {planned.length > 0 && (
        <Reveal className="mt-24 grid gap-8 md:grid-cols-12">
          <p className="eyebrow md:col-span-3">In preparation</p>
          <ul className="md:col-span-9">
            {planned.map((t) => (
              <li key={t.slug} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line py-5 text-ivory-500">
                <span className="font-display text-2xl font-light uppercase">{t.name}</span>
                <span className="font-display text-lg italic">{t.summary}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </div>
  );
}
