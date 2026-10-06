"use client";

import { useState } from "react";
import type { AttendanceCourse, Baseline, Checkpoint, StudentSemesterState } from "@/types/attendance";
import { formatShort } from "@/lib/attendance/dates";
import { cn } from "@/lib/utils";

type Choice = { kind: "semester" } | { kind: "checkpoint"; checkpointId: string };

/** Where the student's count begins: an official notice's figures, or day one. */
export function StartSetup({
  courses,
  checkpoints,
  semesterStart,
  state,
  onSave,
  onCancel,
}: {
  courses: AttendanceCourse[];
  checkpoints: Checkpoint[];
  semesterStart: string;
  state: StudentSemesterState;
  onSave: (start: Choice, baseline: Record<string, Baseline>) => void;
  onCancel?: () => void;
}) {
  const [choice, setChoice] = useState<Choice>(
    state.start ?? (checkpoints[0] ? { kind: "checkpoint", checkpointId: checkpoints[0].id } : { kind: "semester" }),
  );
  const [values, setValues] = useState<Record<string, { attended: string; held: string }>>(() =>
    Object.fromEntries(
      courses.map((c) => [
        c.id,
        {
          attended: state.baseline[c.id] ? String(state.baseline[c.id].attended) : "",
          held: state.baseline[c.id] ? String(state.baseline[c.id].held) : "",
        },
      ]),
    ),
  );
  const [error, setError] = useState<string | null>(null);

  const checkpoint = choice.kind === "checkpoint" ? checkpoints.find((c) => c.id === choice.checkpointId) : undefined;

  function save() {
    if (choice.kind === "semester") return onSave(choice, {});
    const baseline: Record<string, Baseline> = {};
    for (const c of courses) {
      const v = values[c.id];
      if (!v.attended && !v.held) continue;
      const attended = Number(v.attended);
      const held = Number(v.held);
      if (!Number.isInteger(attended) || !Number.isInteger(held) || attended < 0 || held < 0) {
        return setError(`${c.name}: enter whole numbers.`);
      }
      if (attended > held) return setError(`${c.name}: attended can't be more than held.`);
      baseline[c.id] = { attended, held };
    }
    setError(null);
    onSave(choice, baseline);
  }

  return (
    <section aria-labelledby="start-title" className="card p-5 md:p-8">
      <h2 id="start-title" className=" font-display text-3xl font-bold text-slate-900 md:text-4xl">
        Set up your attendance
      </h2>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600">
        Got the mid-sem attendance notice? Choose it and type your numbers from it. After that, just mark each class here and we&rsquo;ll keep count.
        No notice yet? Start from the first day.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {checkpoints.map((cp) => (
          <Option
            key={cp.id}
            active={choice.kind === "checkpoint" && choice.checkpointId === cp.id}
            onClick={() => setChoice({ kind: "checkpoint", checkpointId: cp.id })}
            title={cp.label}
            detail={`Numbers as of ${formatShort(cp.as_of_date)} · you mark classes from ${formatShort(cp.resume_date)}`}
          />
        ))}
        <Option
          active={choice.kind === "semester"}
          onClick={() => setChoice({ kind: "semester" })}
          title="Start from the first day"
          detail={`Mark every class since ${formatShort(semesterStart)}`}
        />
      </div>

      {checkpoint && (
        <div className="mt-6">
          <p className="mb-3 text-[15px] font-bold text-slate-900">Your numbers from the {checkpoint.label}</p>
          <div className="rounded-2xl border border-line px-4">
            <div className="hidden grid-cols-12 gap-6 border-b border-line py-3 text-sm font-semibold text-slate-500 md:grid">
              <span className="col-span-6">Subject</span>
              <span className="col-span-3">Classes attended</span>
              <span className="col-span-3">Classes held</span>
            </div>
            {courses.map((c) => (
              <div key={c.id} className="grid grid-cols-2 items-center gap-x-4 gap-y-2 border-b border-line py-3 last:border-0 md:grid-cols-12">
                <p className="col-span-2 text-[15px] font-semibold text-slate-900 md:col-span-6">
                  {c.name}
                  {c.code && <span className="ml-2 text-sm font-normal text-slate-500">{c.code}</span>}
                </p>
                <label className="md:col-span-3">
                  <span className="field-label md:sr-only">Attended</span>
                  <input
                    inputMode="numeric"
                    className="field text-lg font-semibold tabular"
                    value={values[c.id].attended}
                    onChange={(e) => setValues((v) => ({ ...v, [c.id]: { ...v[c.id], attended: e.target.value.replace(/\D/g, "") } }))}
                    aria-label={`${c.name}: classes attended`}
                    placeholder="0"
                  />
                </label>
                <label className="md:col-span-3">
                  <span className="field-label md:sr-only">Held</span>
                  <input
                    inputMode="numeric"
                    className="field text-lg font-semibold tabular"
                    value={values[c.id].held}
                    onChange={(e) => setValues((v) => ({ ...v, [c.id]: { ...v[c.id], held: e.target.value.replace(/\D/g, "") } }))}
                    aria-label={`${c.name}: classes held`}
                    placeholder="0"
                  />
                </label>
              </div>
            ))}
          </div>
          <p className="mt-2 text-sm text-slate-500">Leave a subject blank if it isn&rsquo;t on your notice. You can edit these later.</p>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[15px] text-rose-700">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} className="btn-solid px-6 py-3.5 text-base">
          Save and open calendar
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-luxe">
            Cancel
          </button>
        )}
      </div>
    </section>
  );
}

function Option({ active, onClick, title, detail }: { active: boolean; onClick: () => void; title: string; detail: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-2xl border-2 p-4 text-left transition",
        active ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-slate-300",
      )}
    >
      <span className="flex items-center gap-3">
        <span aria-hidden className={cn("grid h-5 w-5 place-items-center rounded-full border-2", active ? "border-brand-600" : "border-slate-300")}>
          {active && <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />}
        </span>
        <span className="text-[17px] font-bold text-slate-900">{title}</span>
      </span>
      <span className="mt-1 block pl-8 text-sm text-slate-500">{detail}</span>
    </button>
  );
}
