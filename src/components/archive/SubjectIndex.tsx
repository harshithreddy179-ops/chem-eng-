import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Subject } from "@/types";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { SubjectIcon } from "@/components/ui/SubjectIcon";
import { subjectTheme } from "@/lib/palette";
import { cn } from "@/lib/utils";

export interface SubjectIndexRow {
  subject: Subject;
  href: string;
  chapters: number;
  resources: number;
  keys: string[];
}

/** Grid of subject cards inside an exam, each with progress. */
export function SubjectIndex({ rows }: { rows: SubjectIndexRow[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => {
        const t = subjectTheme(row.subject.slug);
        const empty = row.resources === 0 && row.chapters === 0;
        return (
          <li key={row.subject.id}>
            <Link href={row.href} className={cn("card card-hover group flex h-full flex-col gap-4 p-5", empty && "opacity-75")}>
              <div className="flex items-start justify-between gap-3">
                <SubjectIcon slug={row.subject.slug} />
                {row.keys.length > 0 && <ProgressRing keys={row.keys} label={`${row.subject.name} progress`} color={t.hex} />}
              </div>
              <div>
                <h3 className="text-lg font-bold leading-snug text-slate-900">{row.subject.name}</h3>
                <p className="mt-2 flex flex-wrap gap-1.5">
                  <span className={cn("chip px-2.5 py-0.5 text-xs", t.soft, t.text)}>{row.chapters} chapters</span>
                  <span className="chip bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{row.resources} files</span>
                </p>
              </div>
              <span className={cn("mt-auto inline-flex items-center gap-1.5 text-[15px] font-semibold", empty ? "text-slate-400" : t.text)}>
                {empty ? "Nothing added yet" : "Open subject"}
                {!empty && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
