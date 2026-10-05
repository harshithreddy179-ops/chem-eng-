"use client";

/* ──────────────────────────────────────────────────────────────────────────
   Personal progress store.

   V1 persists to localStorage through a small adapter interface, so a
   cloud-synced adapter (Supabase, per signed-in user) can be dropped in
   later without touching any component: components only use the hooks in
   src/hooks/use-progress.ts.
   ────────────────────────────────────────────────────────────────────────── */

export interface ProgressAdapter {
  load(): string[];
  save(keys: string[]): void;
  /** Subscribe to external changes (e.g. another tab). Returns unsubscribe. */
  watch?(onChange: () => void): () => void;
}

const STORAGE_KEY = "chemical-archive:progress:v1";

export const localProgressAdapter: ProgressAdapter = {
  load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === "string") : [];
    } catch {
      return [];
    }
  },
  save(keys) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    } catch {
      /* storage full or disabled — progress stays in memory for this visit */
    }
  },
  watch(onChange) {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) onChange();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  },
};

let adapter: ProgressAdapter = localProgressAdapter;
let completed: ReadonlySet<string> = new Set();
let hydrated = false;
const listeners = new Set<() => void>();
let unwatch: (() => void) | undefined;

function emit() {
  listeners.forEach((l) => l());
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  completed = new Set(adapter.load());
  hydrated = true;
  unwatch = adapter.watch?.(() => {
    completed = new Set(adapter.load());
    emit();
  });
}

export function setProgressAdapter(next: ProgressAdapter) {
  unwatch?.();
  adapter = next;
  hydrated = false;
  hydrate();
  emit();
}

export function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): ReadonlySet<string> {
  hydrate();
  return completed;
}

const EMPTY: ReadonlySet<string> = new Set();
export function getServerSnapshot(): ReadonlySet<string> {
  return EMPTY;
}

export function isHydrated() {
  return hydrated;
}

export function setCompleted(key: string, value: boolean) {
  hydrate();
  const next = new Set(completed);
  if (value) next.add(key);
  else next.delete(key);
  completed = next;
  adapter.save([...next]);
  emit();
}

export function toggleCompleted(key: string) {
  setCompleted(key, !completed.has(key));
}

export function resetProgress(keys?: string[]) {
  hydrate();
  const next = new Set(completed);
  if (keys) keys.forEach((k) => next.delete(k));
  else next.clear();
  completed = next;
  adapter.save([...next]);
  emit();
}
