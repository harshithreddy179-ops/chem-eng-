"use client";

import { useState } from "react";
import type { AttendanceCourse, Baseline, Checkpoint, StudentSemesterState } from "@/types/attendance";
import { formatShort } from "@/lib/attendance/dates";
import { cn, pad } from "@/lib/utils";

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
    <section aria-labelledby="start-title" className="relative overflow-hidden border border-line p-6 md:p-12">
      <span aria-hidden className="absolute left-0 top-0 h-4 w-4 border-l border-t border-bronze/60" />
      <span aria-hidden className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-bronze/60" />
      <p className="eyebrow text-bronze">Before you begin</p>
      <h2 id="start-title" className="mt-5 font-display text-4xl font-light uppercase leading-[0.95] md:text-5xl">
        Where do you <em className="italic normal-case text-ivory-300">start?</em>
      </h2>
      <p className="mt-4 max-w-2xl font-display text-xl italic leading-snug text-ivory-300">
        Copy the figures from your official attendance notice. From the first class after it, mark each class here and the archive keeps the count.
      </p>

      <div className="mt-10 grid gap-3 md:grid-cols-2">
        {checkpoints.map((cp) => (
          <Option
            key={cp.id}
            active={choice.kind === "checkpoint" && choice.checkpointId === cp.id}
            onClick={() => setChoice({ kind: "checkpoint", checkpointId: cp.id })}
            title={cp.label}
            detail={`Figures as of ${formatShort(cp.as_of_date)} · tracking from ${formatShort(cp.resume_date)}`}
          />
        ))}
        <Option
          active={choice.kind === "semester"}
          onClick={() => setChoice({ kind: "semester" })}
          title="From the first day"
          detail={`Mark every class since ${formatShort(semesterStart)}`}
        />
      </div>

      {checkpoint && (
        <div className="mt-10">
          <p className="eyebrow mb-4">Figures from the {checkpoint.label}</p>
          <div className="border-t border-line">
            <div className="hidden grid-cols-12 gap-6 border-b border-line py-3 font-sans text-[0.58rem] uppercase tracking-[0.22em] text-ivory-500 md:grid">
              <span className="col-span-6">Subject</span>
              <span className="col-span-3">Classes attended</span>
              <span className="col-span-3">Classes held</span>
            </div>
            {courses.map((c, i) => (
              <div key={c.id} className="grid grid-cols-2 items-center gap-x-6 gap-y-2 border-b border-line py-4 md:grid-cols-12">
                <p className="col-span-2 font-display text-xl md:col-span-6">
                  <span className="mr-3 font-sans text-xs tabular text-bronze">{pad(i + 1)}</span>
                  {c.name}
                  {c.code && <span className="ml-2 font-sans text-[0.58rem] uppercase tracking-[0.2em] text-ivory-500">{c.code}</span>}
                </p>
                <label className="md:col-span-3">
                  <span className="field-label md:sr-only">Attended</span>
                  <input
                    inputMode="numeric"
                    className="field font-display text-2xl tabular"
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
                    className="field font-display text-2xl tabular"
                    value={values[c.id].held}
                    onChange={(e) => setValues((v) => ({ ...v, [c.id]: { ...v[c.id], held: e.target.value.replace(/\D/g, "") } }))}
                    aria-label={`${c.name}: classes held`}
                    placeholder="0"
                  />
                </label>
              </div>
            ))}
          </div>
          <p className="mt-3 font-sans text-xs text-ivory-500">Leave a subject blank if it isn&rsquo;t on your notice. You can edit these later.</p>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-6 border border-garnet/40 bg-garnet/10 px-4 py-3 font-sans text-sm text-garnet-300">
          {error}
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <button type="button" onClick={save} className="btn-solid">
          Save &amp; open the calendar
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="link-luxe text-ivory-400">
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
        "border p-5 text-left transition-colors duration-500",
        active ? "border-bronze/70 bg-bronze/[0.08]" : "border-line hover:border-ivory/30",
      )}
    >
      <span className="flex items-center gap-3">
        <span aria-hidden className={cn("h-3 w-3 rounded-full border", active ? "border-bronze bg-bronze" : "border-ivory/40")} />
        <span className="font-display text-2xl font-light">{title}</span>
      </span>
      <span className="mt-2 block pl-6 font-sans text-[0.62rem] uppercase tracking-[0.2em] text-ivory-400">{detail}</span>
    </button>
  );
}
