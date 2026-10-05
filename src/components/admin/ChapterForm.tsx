"use client";

import Link from "next/link";
import { saveChapter } from "@/actions/admin";
import { useAdminForm } from "@/hooks/use-admin-form";
import type { AcademicSection, Chapter, Subject } from "@/types";
import { Field, FormBanner, FormSection, SubmitButton, Toggle, fieldProps } from "./AdminForm";

interface Props {
  chapter?: Chapter | null;
  sections: AcademicSection[];
  subjects: Subject[];
  defaults?: { section?: string; subject?: string };
}

export function ChapterForm({ chapter, sections, subjects, defaults }: Props) {
  const { state, onSubmit, pending } = useAdminForm(saveChapter);
  return (
    <form onSubmit={onSubmit} className="max-w-5xl" noValidate>
      <input type="hidden" name="id" value={chapter?.id ?? ""} />
      <FormBanner state={state} />
      <FormSection title="Placement">
        <div className="grid gap-8 sm:grid-cols-2">
          <Field label="Academic section" name="section_id" error={state.fieldErrors?.section_id} required>
            <select {...fieldProps("section_id", state)} className="field" defaultValue={chapter?.section_id ?? defaults?.section ?? ""}>
              <option value="">Choose…</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Subject" name="subject_id" error={state.fieldErrors?.subject_id} required>
            <select {...fieldProps("subject_id", state)} className="field" defaultValue={chapter?.subject_id ?? defaults?.subject ?? ""}>
              <option value="">Choose…</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </FormSection>
      <FormSection title="Chapter" description="Every chapter automatically gets a “completed” checkbox for students.">
        <Field label="Chapter name" name="name" error={state.fieldErrors?.name} required hint="e.g. Periodic Properties">
          <input {...fieldProps("name", state)} className="field" defaultValue={chapter?.name ?? ""} maxLength={200} />
        </Field>
        <Field label="Description" name="description" error={state.fieldErrors?.description} hint="Optional.">
          <textarea {...fieldProps("description", state)} className="field min-h-[5rem]" defaultValue={chapter?.description ?? ""} />
        </Field>
        <Field label="Display order" name="display_order" error={state.fieldErrors?.display_order} hint="Chapters are numbered in this order.">
          <input {...fieldProps("display_order", state)} type="number" min={0} className="field max-w-[10rem]" defaultValue={chapter?.display_order ?? 0} />
        </Field>
        <Toggle name="is_published" label="Published" defaultChecked={chapter?.is_published ?? true} />
      </FormSection>
      <div className="flex items-center justify-between gap-6 border-t border-line pt-8">
        <Link href="/admin/chapters" className="link-luxe text-ivory-400">
          Cancel
        </Link>
        <SubmitButton pending={pending}>{chapter ? "Save changes" : "Add chapter"}</SubmitButton>
      </div>
    </form>
  );
}
