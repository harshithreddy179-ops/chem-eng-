"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { saveResource } from "@/actions/admin";
import { useAdminForm } from "@/hooks/use-admin-form";
import { RESOURCE_CATEGORIES, RESOURCE_TYPES } from "@/lib/constants";
import { isGoogleDriveUrl } from "@/lib/utils";
import type { AcademicSection, Chapter, Resource, Subject } from "@/types";
import { Field, FormBanner, FormSection, SubmitButton, Toggle, fieldProps } from "./AdminForm";

interface Props {
  resource?: Resource | null;
  sections: AcademicSection[];
  subjects: Subject[];
  chapters: Chapter[];
  defaults?: { section?: string; subject?: string; category?: string };
}

export function ResourceForm({ resource, sections, subjects, chapters, defaults }: Props) {
  const { state, onSubmit, pending } = useAdminForm(saveResource);
  const [sectionId, setSectionId] = useState(resource?.section_id ?? defaults?.section ?? "");
  const [subjectId, setSubjectId] = useState(resource?.subject_id ?? defaults?.subject ?? "");
  const [url, setUrl] = useState(resource?.drive_url ?? "");
  const scopedChapters = useMemo(
    () => chapters.filter((c) => c.section_id === sectionId && c.subject_id === subjectId),
    [chapters, sectionId, subjectId],
  );
  const notDrive = url.startsWith("https://") && !isGoogleDriveUrl(url);

  return (
    <form onSubmit={onSubmit} className="max-w-5xl" noValidate>
      <input type="hidden" name="id" value={resource?.id ?? ""} />
      <FormBanner state={state} />

      <FormSection title="Placement" description="Where this file lives in the archive.">
        <div className="grid gap-8 sm:grid-cols-2">
          <Field label="Academic section" name="section_id" error={state.fieldErrors?.section_id} required>
            <select {...fieldProps("section_id", state)} className="field" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
              <option value="">Choose…</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {!s.is_enabled ? "(disabled)" : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Subject" name="subject_id" error={state.fieldErrors?.subject_id} required>
            <select {...fieldProps("subject_id", state)} className="field" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">Choose…</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {!s.is_enabled ? "(disabled)" : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Category" name="category" error={state.fieldErrors?.category} required hint="Decides the column it appears in on the subject page.">
            <select {...fieldProps("category", state)} className="field" defaultValue={resource?.category ?? defaults?.category ?? "lecture"}>
              {RESOURCE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Chapter / topic"
            name="chapter_id"
            error={state.fieldErrors?.chapter_id}
            hint={sectionId && subjectId && scopedChapters.length === 0 ? "No chapters for this section & subject yet." : "Optional."}
          >
            <select {...fieldProps("chapter_id", state)} className="field" defaultValue={resource?.chapter_id ?? ""} key={`${sectionId}-${subjectId}`}>
              <option value="">None</option>
              {scopedChapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </FormSection>

      <FormSection title="Details" description="What students will see.">
        <div className="grid gap-8 sm:grid-cols-2">
          <Field label="Title" name="title" error={state.fieldErrors?.title} required className="sm:col-span-2" hint="e.g. Chemical Bonding">
            <input {...fieldProps("title", state)} className="field" defaultValue={resource?.title ?? ""} maxLength={200} required />
          </Field>
          <Field label="Label" name="label" error={state.fieldErrors?.label} hint="Short eyebrow, e.g. “Lecture 04” or “May 2024”.">
            <input {...fieldProps("label", state)} className="field" defaultValue={resource?.label ?? ""} maxLength={60} />
          </Field>
          <Field label="Resource type" name="resource_type" error={state.fieldErrors?.resource_type} required>
            <select {...fieldProps("resource_type", state)} className="field" defaultValue={resource?.resource_type ?? "pdf"}>
              {RESOURCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Description" name="description" error={state.fieldErrors?.description} className="sm:col-span-2" hint="Optional, one or two lines.">
            <textarea {...fieldProps("description", state)} className="field min-h-[5rem]" defaultValue={resource?.description ?? ""} maxLength={1000} />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Link" description="Files are never uploaded here — paste the Google Drive share link. Make sure sharing is set to “Anyone with the link”.">
        <Field
          label="Google Drive URL"
          name="drive_url"
          error={state.fieldErrors?.drive_url}
          required
          hint={notDrive ? "This isn't a Google Drive / Docs link — that's allowed, but double-check it." : "https://drive.google.com/…"}
        >
          <input
            {...fieldProps("drive_url", state)}
            type="url"
            inputMode="url"
            className="field"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://drive.google.com/file/d/…/view"
            required
          />
        </Field>
        {url.startsWith("https://") && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="link-luxe self-start text-ivory-300">
            Test link ↗
          </a>
        )}
        <Field label="Optional image URL" name="image_url" error={state.fieldErrors?.image_url} hint="A small cover thumbnail (https).">
          <input {...fieldProps("image_url", state)} type="url" className="field" defaultValue={resource?.image_url ?? ""} />
        </Field>
      </FormSection>

      <FormSection title="Display">
        <Field label="Display order" name="display_order" error={state.fieldErrors?.display_order} hint="Lower numbers appear first.">
          <input {...fieldProps("display_order", state)} type="number" min={0} className="field max-w-[10rem]" defaultValue={resource?.display_order ?? 0} />
        </Field>
        <div>
          <Toggle name="is_published" label="Published" hint="Hidden resources are visible only to admins." defaultChecked={resource?.is_published ?? true} />
          <Toggle name="is_trackable" label="Completion checkbox" hint="Let students tick this off; counts towards progress." defaultChecked={resource?.is_trackable ?? true} />
        </div>
      </FormSection>

      <div className="flex items-center justify-between gap-6 border-t border-line pt-8">
        <Link href="/admin/resources" className="link-luxe text-ivory-400">
          Cancel
        </Link>
        <SubmitButton pending={pending}>{resource ? "Save changes" : "Add resource"}</SubmitButton>
      </div>
    </form>
  );
}
