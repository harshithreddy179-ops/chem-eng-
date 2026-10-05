import Link from "next/link";
import type { Pyq } from "@/types";
import { plainPreview } from "./MathText";
import { pad, cn } from "@/lib/utils";

interface PYQCardProps {
  pyq: Pick<Pyq, "id" | "year" | "exam" | "question_number" | "topic" | "difficulty" | "question">;
  subjectName?: string;
  className?: string;
}

const DIFFICULTY_MARK: Record<string, string> = { easy: "I", medium: "II", hard: "III" };

/** A question in a list: number, year · exam, topic and a quiet preview. */
export function PYQCard({ pyq, subjectName, className }: PYQCardProps) {
  return (
    <Link
      href={`/pyqs/${pyq.id}`}
      className={cn(
        "group relative grid grid-cols-[3rem_1fr] gap-x-5 border-b border-line py-7 transition-colors duration-700 hover:bg-ivory/[0.02] md:grid-cols-[5rem_1fr_auto] md:gap-x-8",
        className,
      )}
    >
      <span className="font-display text-3xl font-light tabular text-ivory-500 transition-colors duration-500 group-hover:text-bronze md:text-4xl">
        {pyq.question_number ? pad(pyq.question_number) : "—"}
      </span>
      <div className="min-w-0">
        <p className="font-sans text-[0.62rem] uppercase tracking-[0.26em] text-bronze">
          {[subjectName, pyq.year, pyq.exam].filter(Boolean).join(" · ")}
        </p>
        {pyq.topic && <p className="mt-2 font-display text-2xl font-light leading-tight text-ivory">{pyq.topic}</p>}
        <p className="mt-2 line-clamp-2 font-sans text-sm leading-relaxed text-ivory-400">{plainPreview(pyq.question)}</p>
      </div>
      <div className="col-start-2 mt-4 flex items-center gap-5 md:col-start-auto md:mt-0 md:flex-col md:items-end md:justify-between">
        {pyq.difficulty && (
          <span className="font-sans text-[0.58rem] uppercase tracking-[0.24em] text-ivory-400">
            <span className="mr-2 font-display text-sm italic tracking-normal text-bronze-300">{DIFFICULTY_MARK[pyq.difficulty]}</span>
            {pyq.difficulty}
          </span>
        )}
        <span className="flex items-center gap-2 font-sans text-[0.62rem] uppercase tracking-luxe text-ivory-300 transition-colors duration-500 group-hover:text-bronze-300">
          Attempt <span aria-hidden className="transition-transform duration-700 ease-luxe group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}
