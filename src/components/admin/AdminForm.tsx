"use client";

import { cn } from "@/lib/utils";
import type { ActionState } from "@/actions/types";

export function Field({
  label,
  name,
  error,
  hint,
  children,
  className,
  required,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={cn("block", className)}>
      <label htmlFor={name} className="field-label">
        {label}
        {required && <span className="ml-1 text-bronze" aria-hidden>*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} role="alert" className="mt-2 font-sans text-xs text-red-300">
          {error}
        </p>
      ) : hint ? (
        <p id={`${name}-hint`} className="mt-2 font-sans text-xs text-ivory-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function fieldProps(name: string, state: ActionState) {
  const error = state.fieldErrors?.[name];
  return {
    id: name,
    name,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${name}-error` : `${name}-hint`,
  } as const;
}

export function Toggle({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-6 border-t border-line py-5">
      <span>
        <span className="block font-sans text-sm text-ivory">{label}</span>
        {hint && <span className="mt-1 block font-sans text-xs text-ivory-500">{hint}</span>}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="h-5 w-9 border border-ivory/25 transition-colors duration-300 peer-checked:border-bronze peer-checked:bg-bronze/30 peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-bronze" />
        <span className="absolute left-1 top-1 h-3 w-3 bg-ivory-400 transition-transform duration-300 peer-checked:translate-x-4 peer-checked:bg-bronze-300" />
      </span>
    </label>
  );
}

export function SubmitButton({ children, className, pending }: { children: React.ReactNode; className?: string; pending?: boolean }) {
  return (
    <button type="submit" disabled={pending} className={cn("btn-solid", className)} aria-busy={pending}>
      {pending ? "Saving…" : children}
    </button>
  );
}

export function FormBanner({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={cn(
        "border px-5 py-4 font-sans text-sm",
        state.ok ? "border-bronze/40 bg-bronze/10 text-bronze-300" : "border-red-400/30 bg-red-500/10 text-red-200",
      )}
    >
      {state.message}
    </p>
  );
}

export function FormSection({ title, children, description }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-line py-10 md:grid-cols-12 md:gap-10">
      <div className="md:col-span-4">
        <h2 className="font-display text-2xl font-light uppercase">{title}</h2>
        {description && <p className="mt-2 font-sans text-sm leading-relaxed text-ivory-500">{description}</p>}
      </div>
      <div className="grid gap-8 md:col-span-8">{children}</div>
    </section>
  );
}
