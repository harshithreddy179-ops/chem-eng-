"use client";

import { useEffect, useState } from "react";
import { deleteAttendanceRecord, saveAttendanceRecord, type AttendanceTable } from "@/actions/attendance";
import { useAdminForm } from "@/hooks/use-admin-form";
import { FormBanner, SubmitButton } from "@/components/admin/AdminForm";
import { cn } from "@/lib/utils";

export interface FieldDef {
  name: string;
  label: string;
  type: "text" | "date" | "time" | "number" | "select" | "checkbox" | "textarea";
  options?: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
  required?: boolean;
  wide?: boolean;
  /** Only show when another field has one of these values. */
  showWhen?: { field: string; values: string[] };
}

export interface EditorRow {
  id: string;
  values: Record<string, string>;
  summary: React.ReactNode;
}

interface Props {
  table: AttendanceTable;
  semesterId: string;
  fields: FieldDef[];
  rows: EditorRow[];
  addLabel: string;
  /** Values always submitted (e.g. day_of_week for a weekday group). */
  fixed?: Record<string, string>;
  defaults?: Record<string, string>;
  empty?: string;
}

/** List + inline edit + add for one attendance table. */
export function RecordEditor({ table, semesterId, fields, rows, addLabel, fixed, defaults, empty }: Props) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div>
      {rows.length === 0 && !adding && empty && <p className="border-t border-line py-5 font-display text-lg text-ivory-500">{empty}</p>}
      {rows.length > 0 && (
        <ul className="border-t border-line">
          {rows.map((row) => (
            <li key={row.id} className="border-b border-line">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4">
                <div className="min-w-0 flex-1">{row.summary}</div>
                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    onClick={() => setEditing(editing === row.id ? null : row.id)}
                    aria-expanded={editing === row.id}
                    className="font-sans text-sm text-ivory-300 hover:text-bronze-300"
                  >
                    {editing === row.id ? "Close" : "Edit"}
                  </button>
                  <form
                    action={deleteAttendanceRecord}
                    onSubmit={(e) => {
                      if (!window.confirm("Delete this entry?")) e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="_table" value={table} />
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="semester_id" value={semesterId} />
                    <button type="submit" className="font-sans text-sm text-garnet-300/80 hover:text-garnet-300">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
              {editing === row.id && (
                <AttendanceRecordForm
                  table={table}
                  semesterId={semesterId}
                  fields={fields}
                  id={row.id}
                  initial={{ ...row.values, ...fixed }}
                  fixed={fixed}
                  submitLabel="Save"
                  onDone={() => setEditing(null)}
                />
              )}
            </li>
          ))}
        </ul>
      )}
      {adding ? (
        <AttendanceRecordForm
          table={table}
          semesterId={semesterId}
          fields={fields}
          initial={{ ...defaults, ...fixed }}
          fixed={fixed}
          submitLabel="Add"
          onDone={() => setAdding(false)}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="link-luxe mt-5 text-bronze-300">
          + {addLabel}
        </button>
      )}
    </div>
  );
}

export function AttendanceRecordForm({
  table,
  semesterId,
  fields,
  id,
  initial,
  fixed,
  submitLabel,
  onDone,
  onCancel,
}: {
  table: AttendanceTable;
  semesterId: string;
  fields: FieldDef[];
  id?: string;
  initial: Record<string, string | undefined>;
  fixed?: Record<string, string>;
  submitLabel: string;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const { state, onSubmit, pending } = useAdminForm(saveAttendanceRecord);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, initial[f.name] ?? (f.type === "checkbox" ? "" : "")])),
  );

  useEffect(() => {
    if (state.ok) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const visible = (f: FieldDef) => !f.showWhen || f.showWhen.values.includes(values[f.showWhen.field] ?? "");
  const err = (name: string) => state.fieldErrors?.[name];

  return (
    <form onSubmit={onSubmit} className="mb-5 grid gap-6 border border-line bg-ink-800/40 p-5 sm:grid-cols-2 md:p-7" noValidate>
      <input type="hidden" name="_table" value={table} />
      <input type="hidden" name="semester_id" value={semesterId} />
      {id && <input type="hidden" name="id" value={id} />}
      {fixed && Object.entries(fixed).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {state.message && !state.ok && (
        <div className="sm:col-span-2">
          <FormBanner state={state} />
        </div>
      )}
      {fields.filter(visible).map((f) => {
        const common = {
          id: `${table}-${id ?? "new"}-${f.name}`,
          name: f.name,
          "aria-invalid": err(f.name) ? true : undefined,
        };
        return (
          <div key={f.name} className={cn(f.wide && "sm:col-span-2", f.type === "checkbox" && "self-end")}>
            {f.type === "checkbox" ? (
              <label className="flex cursor-pointer items-center gap-3 py-3">
                <input
                  {...common}
                  type="checkbox"
                  checked={values[f.name] === "on" || values[f.name] === "true"}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.checked ? "on" : "" }))}
                  className="h-4 w-4 accent-[#b39469]"
                />
                <span className="font-sans text-sm">{f.label}</span>
              </label>
            ) : (
              <>
                <label htmlFor={common.id} className="field-label">
                  {f.label}
                  {f.required && <span className="ml-1 text-bronze">*</span>}
                </label>
                {f.type === "select" ? (
                  <select {...common} className="field" value={values[f.name]} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}>
                    {!f.required && <option value="">—</option>}
                    {f.required && !values[f.name] && <option value="">Choose…</option>}
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea {...common} className="field min-h-[5rem]" value={values[f.name]} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))} />
                ) : (
                  <input
                    {...common}
                    type={f.type}
                    className="field"
                    placeholder={f.placeholder}
                    value={values[f.name]}
                    onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                  />
                )}
              </>
            )}
            {err(f.name) ? (
              <p role="alert" className="mt-2 font-sans text-xs text-red-300">
                {err(f.name)}
              </p>
            ) : f.hint ? (
              <p className="mt-2 font-sans text-xs text-ivory-500">{f.hint}</p>
            ) : null}
          </div>
        );
      })}
      <div className="flex items-center gap-5 sm:col-span-2">
        <SubmitButton pending={pending} className="py-3">
          {submitLabel}
        </SubmitButton>
        {onCancel && (
          <button type="button" onClick={onCancel} className="link-luxe text-ivory-400">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
