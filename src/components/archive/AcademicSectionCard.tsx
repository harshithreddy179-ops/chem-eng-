import Link from "next/link";
import type { AcademicSection } from "@/types";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { pad, cn } from "@/lib/utils";

interface AcademicSectionCardProps {
  section: AcademicSection;
  position: number;
  subjectCount: number;
  resourceCount: number;
  progressKeys: string[];
  className?: string;
}

/** A tall architectural "plate" for one exam section. */
export function AcademicSectionCard({
  section,
  position,
  subjectCount,
  resourceCount,
  progressKeys,
  className,
}: AcademicSectionCardProps) {
  const [word, ...rest] = section.name.split(" ");
  return (
    <Link
      href={`/archive/${section.slug}`}
      className={cn(
        "group relative flex min-h-[22rem] flex-col justify-between overflow-hidden border border-line bg-ink-800/40 p-7 transition-colors duration-1000 ease-luxe hover:border-ivory/25 md:min-h-[28rem] md:p-10",
        className,
      )}
      aria-label={`${section.name} — ${subjectCount} subjects, ${resourceCount} resources`}
    >
      {/* light & numeral */}
      <span
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(179,148,105,0.22),transparent_60%)] opacity-0 transition-opacity duration-1000 ease-luxe group-hover:opacity-100"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-[0.18em] -right-[0.04em] select-none font-display text-[13rem] font-light leading-none text-transparent transition-transform duration-[1600ms] ease-luxe [-webkit-text-stroke:1px_rgba(236,230,218,0.09)] group-hover:-translate-y-3 md:text-[18rem]"
      >
        {pad(position)}
      </span>
      <span aria-hidden className="absolute left-0 top-0 h-px w-0 bg-bronze transition-all duration-1000 ease-luxe group-hover:w-full" />

      <div className="relative flex items-start justify-between">
        <span className="font-sans text-[0.65rem] tabular tracking-[0.3em] text-bronze">{pad(position)}</span>
        <ProgressRing keys={progressKeys} label={`${section.name} progress`} />
      </div>

      <div className="relative">
        <h2 className="font-display text-[3.2rem] font-light uppercase leading-[0.88] tracking-[-0.02em] md:text-[4.6rem]">
          <span className="block">{word}</span>
          {rest.length > 0 && <span className="block italic text-ivory-200">{rest.join(" ")}</span>}
        </h2>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-t border-line pt-5">
          <dl className="flex gap-8 font-sans text-[0.65rem] uppercase tracking-[0.24em] text-ivory-400">
            <div className="flex items-baseline gap-2">
              <dd className="order-1 font-display text-xl tracking-normal text-ivory tabular">{subjectCount}</dd>
              <dt className="order-2">Subjects</dt>
            </div>
            <div className="flex items-baseline gap-2">
              <dd className="order-1 font-display text-xl tracking-normal text-ivory tabular">{resourceCount}</dd>
              <dt className="order-2">Resources</dt>
            </div>
          </dl>
          <span className="flex items-center gap-3 font-sans text-[0.65rem] uppercase tracking-luxe text-ivory-200 transition-colors duration-500 group-hover:text-bronze-300">
            Explore
            <span aria-hidden className="transition-transform duration-700 ease-luxe group-hover:translate-x-1.5">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
