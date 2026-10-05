"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { moveTaxonomy, saveTaxonomy } from "@/actions/admin";
import { useAdminForm } from "@/hooks/use-admin-form";
import { cn, pad } from "@/lib/utils";
import { FormBanner, SubmitButton } from "./AdminForm";

type Kind = "subjects" | "academic_sections";

interface Row {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  display_order: number;
  is_enabled: boolean;
}

/** Inline editor for subjects / academic sections: rename, reorder, enable, add. */
export function TaxonomyManager({ kind, rows, noun }: { kind: Kind; rows: Row[]; noun: string }) {
  return (
    <div>
      <ol className="border-t border-line">
        {rows.map((row, i) => (
          <li key={row.id} className="border-b border-line">
            <TaxonomyRow kind={kind} row={row} index={i} isFirst={i === 0} isLast={i === rows.length - 1} />
          </li>
        ))}
      </ol>
      <div className="mt-14">
        <h2 className="font-display text-3xl font-light uppercase">Add a {noun}</h2>
        <NewTaxonomyForm kind={kind} nextOrder={(rows.at(-1)?.display_order ?? 0) + 1} />
      </div>
    </div>
  );
}

function TaxonomyRow({ kind, row, index, isFirst, isLast }: { kind: Kind; row: Row; index: number; isFirst: boolean; isLast: boolean }) {
  const { state, onSubmit, pending } = useAdminForm(saveTaxonomy);
  const [open, setOpen] = useState(false);
  return (
    <div className="py-5">
      <div className="flex flex-wrap items-center gap-4">
        <span className="w-8 font-sans text-xs tabular tracking-[0.2em] text-bronze">{pad(index + 1)}</span>
        <div className="min-w-0 flex-1">
          <p className={cn("font-display text-2xl font-light uppercase", !row.is_enabled && "text-ivory-500 line-through decoration-1")}>{row.name}</p>
          <p className="font-sans text-xs text-ivory-500">/{row.slug} {row.is_enabled ? "" : "· disabled"}</p>
        </div>
        <div className="flex items-center gap-1">
          {(["up", "down"] as const).map((dir) => (
            <form key={dir} action={moveTaxonomy}>
              <input type="hidden" name="kind" value={kind} />
              <input type="hidden" name="id" value={row.id} />
              <input type="hidden" name="direction" value={dir} />
              <button
                type="submit"
                disabled={dir === "up" ? isFirst : isLast}
                aria-label={`Move ${row.name} ${dir}`}
                className="grid h-9 w-9 place-items-center border border-line text-ivory-400 transition-colors hover:border-ivory/30 hover:text-ivory disabled:opacity-25"
              >
                {dir === "up" ? <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.25} /> : <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.25} />}
              </button>
            </form>
          ))}
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="ml-3 font-sans text-[0.65rem] uppercase tracking-[0.2em] text-ivory-300 hover:text-bronze-300">
            {open ? "Close" : "Edit"}
          </button>
        </div>
      </div>
      {open && (
        <form onSubmit={onSubmit} className="mt-6 grid gap-6 border border-line p-5 md:grid-cols-2 md:p-8">
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="id" value={row.id} />
          <div className="md:col-span-2">
            <FormBanner state={state} />
          </div>
          <label className="block">
            <span className="field-label">Name</span>
            <input name="name" defaultValue={row.name} className="field" required />
            {state.fieldErrors?.name && <span className="mt-1 block text-xs text-red-300">{state.fieldErrors.name}</span>}
          </label>
          <label className="block">
            <span className="field-label">URL slug</span>
            <input name="slug" defaultValue={row.slug} className="field" />
            <span className="mt-1 block text-xs text-ivory-500">{state.fieldErrors?.slug ?? "Changing it changes public URLs."}</span>
          </label>
          <label className="block md:col-span-2">
            <span className="field-label">Description</span>
            <input name="description" defaultValue={row.description ?? ""} className="field" />
          </label>
          <label className="block">
            <span className="field-label">Display order</span>
            <input name="display_order" type="number" min={0} defaultValue={row.display_order} className="field" />
          </label>
          <label className="flex items-center gap-3 self-end py-3">
            <input type="checkbox" name="is_enabled" defaultChecked={row.is_enabled} className="h-4 w-4 accent-[#b39469]" />
            <span className="font-sans text-sm">Enabled (visible publicly)</span>
          </label>
          <div className="md:col-span-2">
            <SubmitButton pending={pending}>Save</SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}

function NewTaxonomyForm({ kind, nextOrder }: { kind: Kind; nextOrder: number }) {
  const { state, onSubmit, pending } = useAdminForm(saveTaxonomy);
  return (
    <form
      onSubmit={onSubmit}
      key={state.ok ? state.message + String(nextOrder) : "new"}
      className="mt-6 grid gap-6 border border-line p-5 md:grid-cols-2 md:p-8"
    >
      <input type="hidden" name="kind" value={kind} />
      <div className="md:col-span-2">
        <FormBanner state={state} />
      </div>
      <label className="block">
        <span className="field-label">Name *</span>
        <input name="name" className="field" required />
        {state.fieldErrors?.name && <span className="mt-1 block text-xs text-red-300">{state.fieldErrors.name}</span>}
      </label>
      <label className="block">
        <span className="field-label">URL slug</span>
        <input name="slug" className="field" placeholder="Generated from the name" />
        {state.fieldErrors?.slug && <span className="mt-1 block text-xs text-red-300">{state.fieldErrors.slug}</span>}
      </label>
      <label className="block md:col-span-2">
        <span className="field-label">Description</span>
        <input name="description" className="field" />
      </label>
      <label className="block">
        <span className="field-label">Display order</span>
        <input name="display_order" type="number" min={0} defaultValue={nextOrder} className="field" />
      </label>
      <label className="flex items-center gap-3 self-end py-3">
        <input type="checkbox" name="is_enabled" defaultChecked className="h-4 w-4 accent-[#b39469]" />
        <span className="font-sans text-sm">Enabled</span>
      </label>
      <div className="md:col-span-2">
        <SubmitButton pending={pending}>Add</SubmitButton>
      </div>
    </form>
  );
}
