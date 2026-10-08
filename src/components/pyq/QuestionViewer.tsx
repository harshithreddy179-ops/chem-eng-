import type { PyqWithRelations } from "@/types";
import { MathText } from "./MathText";
import { SolutionReveal } from "./SolutionReveal";
import { RelatedMaterial } from "./RelatedMaterial";
import { SubjectIcon } from "@/components/ui/SubjectIcon";
import { DIFFICULTY_STYLE } from "@/lib/palette";
import { cn, safeHttpsUrl } from "@/lib/utils";

const LETTERS = "ABCDEFGHIJ";

/** The question card: tags, statement, figure and options. */
export function QuestionStatement({ pyq, heading = "h1" }: { pyq: PyqWithRelations; heading?: "h1" | "h2" }) {
  const H = heading;
  const image = safeHttpsUrl(pyq.question_image_url);
  return (
    <div className="card min-w-0 overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-slate-50/70 px-4 py-4 sm:px-5">
        <SubjectIcon slug={pyq.subject?.slug} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-500">{pyq.subject?.name}</p>
          <H className="text-xl font-bold text-slate-900">Question {pyq.question_number ?? ""}</H>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="chip bg-brand-50 text-brand-700">{pyq.year}</span>
          <span className="chip bg-slate-100 text-slate-600">{pyq.exam}</span>
          {pyq.section && <span className="chip bg-violet-50 text-violet-700">{pyq.section.name}</span>}
          {pyq.difficulty && <span className={cn("chip capitalize", DIFFICULTY_STYLE[pyq.difficulty])}>{pyq.difficulty}</span>}
          {pyq.marks != null && pyq.marks > 0 && <span className="chip bg-amber-50 text-amber-700">{pyq.marks} marks</span>}
        </div>
      </div>
      <div className="min-w-0 px-4 py-5 sm:px-5 sm:py-6 md:px-7 md:py-7">
        {pyq.topic && <p className="mb-3 text-sm font-semibold text-brand-600">Topic: {pyq.topic}</p>}
        <MathText text={pyq.question} className="text-[1.08rem] md:text-[1.15rem]" />
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="Figure for the question" loading="lazy" className="mt-6 max-h-[32rem] w-auto rounded-xl border border-line" />
        )}
        {pyq.options && pyq.options.length > 0 && (
          <ol className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {pyq.options.map((opt, i) => (
              <li key={i} className="flex items-baseline gap-3 rounded-xl border border-line px-4 py-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">{LETTERS[i]}</span>
                <MathText text={opt} className="text-[0.98rem]" />
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

export function QuestionViewer({ pyq, nav }: { pyq: PyqWithRelations; nav?: React.ReactNode }) {
  return (
    <article className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="min-w-0 space-y-5 lg:col-span-8">
        <QuestionStatement pyq={pyq} />
        <SolutionReveal hasSolution={Boolean(pyq.solution)} correctAnswer={pyq.correct_answer}>
          {pyq.solution && <MathText text={pyq.solution} />}
        </SolutionReveal>
        {nav}
      </div>
      <div className="min-w-0 space-y-5 lg:col-span-4">
        <RelatedMaterial resources={pyq.related} subjectName={pyq.subject?.name} />
      </div>
    </article>
  );
}
