import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import type { AcademicSection } from "@/types";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { sectionTheme } from "@/lib/palette";
import { cn } from "@/lib/utils";

interface AcademicSectionCardProps {
  section: AcademicSection;
  position: number;
  subjectCount: number;
  resourceCount: number;
  progressKeys: string[];
  className?: string;
}

/** Card for one exam (Midsem 1, Semester 1, …). */
export function AcademicSectionCard({ section, subjectCount, resourceCount, progressKeys, className }: AcademicSectionCardProps) {
  const t = sectionTheme(section.slug);
  const ready = resourceCount > 0;
  return (
    <Link
      href={`/archive/${section.slug}`}
      className={cn("card card-hover group flex h-full flex-col gap-5 p-5", className)}
      aria-label={`${section.name}: ${subjectCount} subjects, ${resourceCount} files`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn("grid h-12 w-12 place-items-center rounded-xl", t.soft, t.text)}>
          <GraduationCap className="h-6 w-6" />
        </span>
        {progressKeys.length > 0 ? (
          <ProgressRing keys={progressKeys} label={`${section.name} progress`} color={t.hex} />
        ) : (
          <span className={cn("chip", ready ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>
            {ready ? "Available" : "Coming soon"}
          </span>
        )}
      </div>
      <div>
        <h2 className="font-display text-3xl font-bold text-slate-900">{section.name}</h2>
        <p className="mt-1 text-[15px] text-slate-500">
          {subjectCount} subjects · {resourceCount} files
        </p>
      </div>
      <span className={cn("mt-auto inline-flex items-center gap-1.5 text-[15px] font-semibold", t.text)}>
        Open {section.name} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
