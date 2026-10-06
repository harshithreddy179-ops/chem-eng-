"use client";

import type { MarkStatus, StudentSemesterState } from "@/types/attendance";

/* ──────────────────────────────────────────────────────────────────────────
   Student attendance marks — localStorage in V1, behind a tiny adapter so a
   Supabase-backed store (per signed-in student) can replace it later.
   ────────────────────────────────────────────────────────────────────────── */

const KEY = "chemical-archive:attendance:v1";

type AllState = Record<string, StudentSemesterState>; // keyed by semester id

let state: AllState = {};
let hydrated = false;
const listeners = new Set<() => void>();
const EMPTY: AllState = {};

function load(): AllState {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  state = load();
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      state = load();
      listeners.forEach((l) => l());
    }
  });
}

function commit(next: AllState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — keep in memory */
  }
  listeners.forEach((l) => l());
}

export function subscribeAttendance(l: () => void) {
  hydrate();
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getAttendanceSnapshot(): AllState {
  hydrate();
  return state;
}

export function getAttendanceServerSnapshot(): AllState {
  return EMPTY;
}

export function emptySemesterState(): StudentSemesterState {
  return { batch: null, baseline: {}, marks: {} };
}

export function updateSemester(semesterId: string, fn: (s: StudentSemesterState) => StudentSemesterState) {
  hydrate();
  const current = state[semesterId] ?? emptySemesterState();
  commit({ ...state, [semesterId]: fn(current) });
}

export function setMark(semesterId: string, key: string, status: MarkStatus | null) {
  updateSemester(semesterId, (s) => {
    const marks = { ...s.marks };
    if (status) marks[key] = status;
    else delete marks[key];
    return { ...s, marks };
  });
}

export function setMarks(semesterId: string, entries: [string, MarkStatus][]) {
  updateSemester(semesterId, (s) => ({ ...s, marks: { ...s.marks, ...Object.fromEntries(entries) } }));
}

export function resetSemester(semesterId: string) {
  hydrate();
  const next = { ...state };
  delete next[semesterId];
  commit(next);
}
