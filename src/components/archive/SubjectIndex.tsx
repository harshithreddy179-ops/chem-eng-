import Link from "next/link";
import type { Subject } from "@/types";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ProgressStat } from "@/components/ui/ProgressStat";
import { SubjectMotif } from "@/components/visual/SubjectMotif";
import { Reveal } from "@/components/motion/Reveal";
import { pad } from "@/lib/utils";

export interface SubjectIndexRow {
  subject: Subject;
  href: string;
  chapters: number;
  resources: number;
  keys: string[];
}

/** Large editorial rows of subjects inside a section, each with progress. */
export function SubjectIndex({ rows }: { rows: SubjectIndexRow[] }) {
  return (
    <ol className="border-t border-line">
      {rows.map((row, i) => (
        <Reveal as="li" key={row.subject.id} delay={i * 0.05} className="border-b border-line">
          <Link href={row.href} className="group relative grid grid-cols-[2.25rem_1fr] items-center gap-x-4 gap-y-5 py-9 md:grid-cols-[4rem_1fr_9rem_10rem_3rem] md:gap-x-8 md:py-11">
            <span aria-hidden className="absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-ivory/[0.035] to-transparent transition-transform duration-1000 ease-luxe group-hover:scale-x-100" />
            <span className="relative font-sans text-xs tabular tracking-[0.2em] text-ivory-500 transition-colors duration-500 group-hover:text-bronze">
              {pad(i + 1)}
            </span>
            <div className="relative min-w-0">
              <h3 className="font-display text-[2rem] font-light uppercase leading-[0.95] transition-transform duration-1000 ease-luxe group-hover:translate-x-2 md:text-[3.1rem]">
                {row.subject.name}
              </h3>
              <p className="mt-3 font-sans text-[0.62rem] uppercase tracking-[0.24em] text-ivory-500">
                <span className="tabular">{row.chapters}</span> chapters · <span className="tabular">{row.resources}</span> resources ·{" "}
                <ProgressStat keys={row.keys} className="text-ivory-300" />
              </p>
            </div>
            <span aria-hidden className="relative col-start-2 hidden h-20 w-full text-ivory/25 transition-colors duration-1000 group-hover:text-bronze/70 md:col-start-auto md:block">
              <SubjectMotif slug={row.subject.slug} />
            </span>
            <span className="relative col-start-2 flex items-center gap-4 md:col-start-auto md:justify-end">
              <ProgressRing keys={row.keys} size={48} label={`${row.subject.name} progress`} />
            </span>
            <span aria-hidden className="relative hidden text-right font-sans text-lg text-ivory-400 transition-all duration-700 ease-luxe group-hover:translate-x-1 group-hover:text-bronze md:block">
              →
            </span>
          </Link>
        </Reveal>
      ))}
    </ol>
  );
}
