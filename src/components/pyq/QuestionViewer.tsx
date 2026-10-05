import type { PyqWithRelations } from "@/types";
import { MathText } from "./MathText";
import { SolutionReveal } from "./SolutionReveal";
import { RelatedMaterial } from "./RelatedMaterial";
import { pad, safeHttpsUrl } from "@/lib/utils";

const LETTERS = "ABCDEFGHIJ";

/** The full question: masthead, statement, options, reveal, related material. */
export function QuestionStatement({ pyq, heading = "h1" }: { pyq: PyqWithRelations; heading?: "h1" | "h2" }) {
  const H = heading;
  const image = safeHttpsUrl(pyq.question_image_url);
  return (
    <div>
      <p className="font-sans text-[0.65rem] uppercase tracking-[0.3em] text-bronze">{pyq.subject?.name}</p>
      <p className="mt-3 font-sans text-[0.65rem] uppercase tracking-[0.3em] text-ivory-400">
        {[pyq.year, pyq.exam, pyq.section?.name].filter(Boolean).join(" · ")}
      </p>
      <H className="mt-8 font-display text-display-lg font-light uppercase">
        Question <span className="italic text-ivory-300">{pyq.question_number ? pad(pyq.question_number) : "—"}</span>
      </H>
      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 font-sans text-[0.62rem] uppercase tracking-[0.24em] text-ivory-500">
        {pyq.topic && <span>Topic · <span className="text-ivory-300">{pyq.topic}</span></span>}
        {pyq.difficulty && <span>Difficulty · <span className="text-ivory-300">{pyq.difficulty}</span></span>}
        {pyq.marks != null && <span>Marks · <span className="text-ivory-300">{pyq.marks}</span></span>}
      </div>

      <div className="mt-12 border-t border-line pt-10">
        <MathText text={pyq.question} className="text-[1.15rem] md:text-[1.25rem]" />
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="Figure accompanying the question" loading="lazy" className="mt-10 max-h-[32rem] w-auto border border-line bg-ivory/5" />
        )}
        {pyq.options && pyq.options.length > 0 && (
          <ol className="mt-10 grid gap-3 sm:grid-cols-2">
            {pyq.options.map((opt, i) => (
              <li key={i} className="flex items-baseline gap-4 border border-line px-5 py-4">
                <span className="font-display text-xl italic text-bronze">{LETTERS[i]}</span>
                <MathText text={opt} className="text-[0.98rem]" />
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

export function QuestionViewer({ pyq }: { pyq: PyqWithRelations }) {
  return (
    <article className="grid gap-16 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <QuestionStatement pyq={pyq} />
        <p className="mt-14 font-display text-xl italic text-ivory-400">Solve it physically — pen, paper, no shortcuts.</p>
        <SolutionReveal className="mt-8" hasSolution={Boolean(pyq.solution)} correctAnswer={pyq.correct_answer}>
          {pyq.solution && <MathText text={pyq.solution} />}
        </SolutionReveal>
      </div>
      <div className="lg:col-span-4 lg:pt-40">
        <RelatedMaterial resources={pyq.related} subjectName={pyq.subject?.name} />
      </div>
    </article>
  );
}
