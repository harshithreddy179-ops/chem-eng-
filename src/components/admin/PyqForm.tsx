"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { savePyq } from "@/actions/admin";
import { useAdminForm } from "@/hooks/use-admin-form";
import { DIFFICULTIES, EXAM_PRESETS, RESOURCE_TYPE_LABEL } from "@/lib/constants";
import type { AcademicSection, Chapter, Pyq, Resource, Subject } from "@/types";
import { Field, FormBanner, FormSection, SubmitButton, Toggle, fieldProps } from "./AdminForm";

type LiteResource = Pick<Resource, "id" | "title" | "label" | "subject_id" | "section_id" | "resource_type" | "category">;

interface Props {
  pyq?: Pyq | null;
  relatedIds?: string[];
  sections: AcademicSection[];
  subjects: Subject[];
  chapters: Chapter[];
  resources: LiteResource[];
  topics: string[];
}

export function PyqForm({ pyq, relatedIds = [], sections, subjects, chapters, resources, topics }: Props) {
  const { state, onSubmit, pending } = useAdminForm(savePyq);
  const [sectionId, setSectionId] = useState(pyq?.section_id ?? "");
  const [subjectId, setSubjectId] = useState(pyq?.subject_id ?? "");
  const [related, setRelated] = useState<string[]>(relatedIds);
  const [relatedQuery, setRelatedQuery] = useState("");
  const sectionName = new Map(sections.map((s) => [s.id, s.name]));

  const scopedChapters = useMemo(
    () => chapters.filter((c) => c.subject_id === subjectId && (!sectionId || c.section_id === sectionId)),
    [chapters, sectionId, subjectId],
  );
  const candidateResources = useMemo(() => {
    const q = relatedQuery.toLowerCase();
    return resources
      .filter((r) => (!subjectId || r.subject_id === subjectId) && (!q || `${r.label ?? ""} ${r.title}`.toLowerCase().includes(q)))
      .sort((a, b) => Number(related.includes(b.id)) - Number(related.includes(a.id)));
  }, [resources, subjectId, relatedQuery, related]);

  return (
    <form onSubmit={onSubmit} className="max-w-5xl" noValidate>
      <input type="hidden" name="id" value={pyq?.id ?? ""} />
      {related.map((id) => (
        <input key={id} type="hidden" name="related" value={id} />
      ))}
      <FormBanner state={state} />

      <FormSection title="Source" description="Which paper this question comes from.">
        <div className="grid gap-8 sm:grid-cols-2">
          <Field label="Subject" name="subject_id" error={state.fieldErrors?.subject_id} required>
            <select {...fieldProps("subject_id", state)} className="field" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">Choose…</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Academic section" name="section_id" error={state.fieldErrors?.section_id} hint="Optional — links the question to an exam section.">
            <select {...fieldProps("section_id", state)} className="field" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
              <option value="">None</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Year" name="year" error={state.fieldErrors?.year} required>
            <input {...fieldProps("year", state)} type="number" min={1990} max={2100} className="field" defaultValue={pyq?.year ?? ""} placeholder="2025" />
          </Field>
          <Field label="Exam" name="exam" error={state.fieldErrors?.exam} required hint="e.g. End Semester">
            <input {...fieldProps("exam", state)} list="exam-presets" className="field" defaultValue={pyq?.exam ?? ""} />
            <datalist id="exam-presets">
              {EXAM_PRESETS.map((e) => (
                <option key={e} value={e} />
              ))}
            </datalist>
          </Field>
          <Field label="Question number" name="question_number" error={state.fieldErrors?.question_number}>
            <input {...fieldProps("question_number", state)} type="number" min={1} className="field" defaultValue={pyq?.question_number ?? ""} />
          </Field>
          <Field label="Marks" name="marks" error={state.fieldErrors?.marks}>
            <input {...fieldProps("marks", state)} type="number" min={0} step="0.5" className="field" defaultValue={pyq?.marks ?? ""} />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Classification">
        <div className="grid gap-8 sm:grid-cols-2">
          <Field label="Topic" name="topic" error={state.fieldErrors?.topic} hint="e.g. Euler's Theorem">
            <input {...fieldProps("topic", state)} list="topic-list" className="field" defaultValue={pyq?.topic ?? ""} />
            <datalist id="topic-list">
              {topics.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </Field>
          <Field label="Difficulty" name="difficulty" error={state.fieldErrors?.difficulty}>
            <select {...fieldProps("difficulty", state)} className="field" defaultValue={pyq?.difficulty ?? ""}>
              <option value="">Unrated</option>
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Chapter" name="chapter_id" error={state.fieldErrors?.chapter_id} className="sm:col-span-2" hint="Optional.">
            <select {...fieldProps("chapter_id", state)} className="field" defaultValue={pyq?.chapter_id ?? ""} key={`${sectionId}-${subjectId}`}>
              <option value="">None</option>
              {scopedChapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {!sectionId ? ` — ${sectionName.get(c.section_id) ?? ""}` : ""}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Question & solution"
        description="Plain text. Use $…$ for inline maths and $$…$$ for display maths (LaTeX). Leave a blank line between paragraphs."
      >
        <Field label="Question" name="question" error={state.fieldErrors?.question} required>
          <textarea {...fieldProps("question", state)} className="field min-h-[10rem] font-mono text-sm" defaultValue={pyq?.question ?? ""} placeholder="If $u = f(x, y)$ is homogeneous of degree $n$, show that $$x\frac{\partial u}{\partial x} + y\frac{\partial u}{\partial y} = nu$$" />
        </Field>
        <Field label="Optional question image URL" name="question_image_url" error={state.fieldErrors?.question_image_url} hint="For diagrams — an https link (e.g. a public image).">
          <input {...fieldProps("question_image_url", state)} type="url" className="field" defaultValue={pyq?.question_image_url ?? ""} />
        </Field>
        <Field label="Options (objective questions)" name="options" error={state.fieldErrors?.options} hint="Optional — one option per line. Shown as A, B, C…">
          <textarea {...fieldProps("options", state)} className="field min-h-[6rem]" defaultValue={pyq?.options?.join("\n") ?? ""} />
        </Field>
        <Field label="Correct answer" name="correct_answer" error={state.fieldErrors?.correct_answer} hint="Optional — e.g. “B” or a final numeric answer. Revealed with the solution.">
          <input {...fieldProps("correct_answer", state)} className="field" defaultValue={pyq?.correct_answer ?? ""} />
        </Field>
        <Field label="Solution" name="solution" error={state.fieldErrors?.solution} hint="Revealed only when the student asks for it.">
          <textarea {...fieldProps("solution", state)} className="field min-h-[12rem] font-mono text-sm" defaultValue={pyq?.solution ?? ""} />
        </Field>
      </FormSection>

      <FormSection title="Related material" description="Link the lecture or notes this question draws on. Students see these under the question.">
        <div>
          <input
            type="search"
            className="field"
            placeholder={subjectId ? "Filter this subject's resources…" : "Choose a subject first, or search all resources…"}
            value={relatedQuery}
            onChange={(e) => setRelatedQuery(e.target.value)}
            aria-label="Filter resources"
          />
          <p className="mt-3 font-sans text-xs text-ivory-500">{related.length} selected</p>
          <ul className="mt-4 max-h-80 overflow-y-auto border-t border-line">
            {candidateResources.length === 0 && <li className="py-4 font-sans text-sm text-ivory-500">No resources to link yet.</li>}
            {candidateResources.map((r) => {
              const checked = related.includes(r.id);
              return (
                <li key={r.id} className="border-b border-line">
                  <label className="flex cursor-pointer items-center gap-4 py-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setRelated((prev) => (e.target.checked ? [...prev, r.id] : prev.filter((x) => x !== r.id)))}
                      className="h-4 w-4 accent-[#b39469]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-sans text-sm text-ivory">
                        {r.label ? `${r.label} — ` : ""}
                        {r.title}
                      </span>
                      <span className="block font-sans text-[0.6rem] uppercase tracking-[0.18em] text-ivory-500">
                        {RESOURCE_TYPE_LABEL[r.resource_type]} · {sectionName.get(r.section_id) ?? ""}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      </FormSection>

      <FormSection title="Visibility">
        <Toggle name="is_published" label="Published" hint="Hidden questions are visible only to admins." defaultChecked={pyq?.is_published ?? true} />
      </FormSection>

      <div className="flex items-center justify-between gap-6 border-t border-line pt-8">
        <Link href="/admin/pyqs" className="link-luxe text-ivory-400">
          Cancel
        </Link>
        <SubmitButton pending={pending}>{pyq ? "Save changes" : "Add question"}</SubmitButton>
      </div>
    </form>
  );
}
