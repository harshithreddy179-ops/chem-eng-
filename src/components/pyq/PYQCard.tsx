import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Pyq } from "@/types";
import { plainPreview } from "./MathText";
import { DIFFICULTY_STYLE } from "@/lib/palette";
import { cn } from "@/lib/utils";

interface PYQCardProps {
  pyq: Pick<Pyq, "id" | "year" | "exam" | "question_number" | "topic" | "difficulty" | "question"> & { marks?: number | null };
  subjectName?: string;
  className?: string;
}

/** A question in a list: number, year, exam, difficulty and a short preview. */
export function PYQCard({ pyq, subjectName, className }: PYQCardProps) {
  return (
    <Link href={`/pyqs/${pyq.id}`} className={cn("card card-hover group flex h-full flex-col gap-3 p-4 md:p-5", className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="chip bg-brand-600 text-white">Q{pyq.question_number ?? "–"}</span>
        <span className="chip bg-brand-50 text-brand-700">{pyq.year}</span>
        <span className="chip bg-slate-100 text-slate-600">{pyq.exam}</span>
        {pyq.difficulty && <span className={cn("chip capitalize", DIFFICULTY_STYLE[pyq.difficulty])}>{pyq.difficulty}</span>}
        {pyq.marks != null && pyq.marks > 0 && <span className="chip bg-amber-50 text-amber-700">{pyq.marks} marks</span>}
      </div>
      {subjectName && <p className="text-sm font-semibold text-slate-500">{subjectName}</p>}
      {pyq.topic && <p className="text-[17px] font-semibold text-slate-900">{pyq.topic}</p>}
      <p className="line-clamp-3 text-[15px] leading-relaxed text-slate-700">{plainPreview(pyq.question)}</p>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-[15px] font-semibold text-brand-600">
        Solve this question <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
