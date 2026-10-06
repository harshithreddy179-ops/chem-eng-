"use client";

import { useEffect, useMemo, useState } from "react";
import type { SemesterConfig } from "@/types/attendance";
import { computeStats, formatPercent, getDay, indexSemester, percentOf } from "@/lib/attendance/engine";
import { addDays, formatShort, todayISO } from "@/lib/attendance/dates";
import { setMark, setMarks, updateSemester } from "@/lib/attendance/store";
import { useStudentSemester } from "@/hooks/use-attendance";
import { AttendanceCalendar } from "./AttendanceCalendar";
import { DayDetail } from "./DayDetail";
import { AttendanceSummary, allowanceText } from "./AttendanceSummary";
import { AttendanceHistory } from "./AttendanceHistory";
import { StartSetup } from "./StartSetup";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

const PREF_KEY = "chemical-archive:attendance:semester";

function clampDate(d: string, from: string, to: string) {
  return d < from ? from : d > to ? to : d;
}

export function AttendanceApp({ configs }: { configs: SemesterConfig[] }) {
  const [semesterId, setSemesterId] = useState(configs[0]?.semester.id);
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setToday(todayISO());
    try {
      const saved = localStorage.getItem(PREF_KEY);
      if (saved && configs.some((c) => c.semester.id === saved)) setSemesterId(saved);
    } catch {
      /* ignore */
    }
  }, [configs]);

  const config = configs.find((c) => c.semester.id === semesterId);
  if (!config) {
    return (
      <EmptyState
        title="The timetable is being set up"
        message="Attendance opens once the semester's calendar and weekly timetable have been added."
      />
    );
  }
  if (!today) return <div className="min-h-[60vh]" aria-busy="true" />;

  return (
    <SemesterView
      key={config.semester.id}
      config={config}
      configs={configs}
      today={today}
      onSemester={(id) => {
        setSemesterId(id);
        try {
          localStorage.setItem(PREF_KEY, id);
        } catch {
          /* ignore */
        }
      }}
    />
  );
}

function SemesterView({
  config,
  configs,
  today,
  onSemester,
}: {
  config: SemesterConfig;
  configs: SemesterConfig[];
  today: string;
  onSemester: (id: string) => void;
}) {
  const { semester, courses, checkpoints } = config;
  const index = useMemo(() => indexSemester(config), [config]);
  const state = useStudentSemester(semester.id);
  const target = state.target ?? semester.target_percent;
  const stats = useMemo(() => computeStats(index, state, today), [index, state, today]);
  const courseMap = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);

  const initial = clampDate(today, semester.start_date, semester.end_date);
  const [selected, setSelected] = useState(initial);
  const [month, setMonth] = useState(initial.slice(0, 7));
  const [editingStart, setEditingStart] = useState(false);

  const day = useMemo(() => getDay(index, selected, state.batch), [index, selected, state.batch]);
  const checkpoint =
    state.start?.kind === "checkpoint" ? checkpoints.find((c) => state.start?.kind === "checkpoint" && c.id === state.start.checkpointId) : undefined;
  const overallPct = percentOf(stats.overall);
  const remaining = [...stats.courses.values()].reduce((n, c) => n + c.remaining, 0);
  const firstUnmarked = useMemo(() => {
    let first: string | null = null;
    for (const c of stats.courses.values())
      for (const h of c.history) if (h.status === "unmarked" && (!first || h.date < first)) first = h.date;
    return first;
  }, [stats]);

  const open = (d: string) => {
    setSelected(d);
    setMonth(d.slice(0, 7));
    document.getElementById("day-detail")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const needsSetup = !state.start || editingStart;

  return (
    <div>
      {/* ─── Controls ─────────────────────────────────────────────── */}
      <div className="card flex flex-wrap items-end gap-x-8 gap-y-4 p-4 md:p-5">
        {configs.length > 1 ? (
          <label className="block min-w-[14rem]">
            <span className="field-label">Semester</span>
            <select className="field" value={semester.id} onChange={(e) => onSemester(e.target.value)}>
              {configs.map((c) => (
                <option key={c.semester.id} value={c.semester.id}>
                  {c.semester.name} · {c.semester.academic_year}
                  {c.semester.group_label ? ` · ${c.semester.group_label}` : ""}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div>
            <p className="field-label">Semester</p>
            <p className="py-2.5 text-[15px] font-semibold text-slate-900">
              {semester.name} · {semester.academic_year}
              {semester.group_label && <span className="font-normal text-slate-500"> · {semester.group_label}</span>}
            </p>
          </div>
        )}
        {semester.batches.length > 0 && (
          <div>
            <p className="field-label">Lab batch</p>
            <div role="radiogroup" aria-label="Lab batch" className="flex gap-1 rounded-xl bg-slate-100 p-1">
              {[null, ...semester.batches].map((b) => (
                <button
                  key={b ?? "all"}
                  type="button"
                  role="radio"
                  aria-checked={state.batch === b}
                  onClick={() => updateSemester(semester.id, (s) => ({ ...s, batch: b }))}
                  className={cn(
                    "rounded-lg px-4 py-2 text-[15px] font-semibold transition",
                    state.batch === b ? "bg-white text-brand-700 shadow-sm" : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  {b ?? "Both"}
                </button>
              ))}
            </div>
          </div>
        )}
        <label className="block w-28">
          <span className="field-label">Target %</span>
          <input
            type="number"
            min={1}
            max={100}
            inputMode="numeric"
            className="field text-lg font-semibold tabular"
            value={target}
            onChange={(e) => {
              const v = Math.min(100, Math.max(1, Number(e.target.value) || semester.target_percent));
              updateSemester(semester.id, (s) => ({ ...s, target: v }));
            }}
          />
        </label>
        {state.start && !editingStart && (
          <button type="button" onClick={() => setEditingStart(true)} className="btn-luxe mb-0.5 px-4 py-2.5 text-sm">
            {checkpoint ? "Edit notice figures" : "Change starting point"}
          </button>
        )}
      </div>

      {needsSetup ? (
        <div className="mt-6">
          <StartSetup
            courses={courses}
            checkpoints={checkpoints}
            semesterStart={semester.start_date}
            state={state}
            onCancel={state.start ? () => setEditingStart(false) : undefined}
            onSave={(start, baseline) => {
              updateSemester(semester.id, (s) => ({ ...s, start, baseline }));
              setEditingStart(false);
            }}
          />
        </div>
      ) : (
        <>
          {/* ─── Overall ─────────────────────────────────────────────── */}
          <div className="mt-6 grid gap-4 md:grid-cols-12">
            <div
              className={cn(
                "card flex items-center gap-5 p-5 md:col-span-5",
                overallPct == null ? "" : overallPct < target ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50",
              )}
            >
              <div>
                <p className="text-[15px] font-semibold text-slate-600">Overall attendance</p>
                <p className={cn("mt-1 text-6xl font-bold leading-none tabular", overallPct == null ? "text-slate-400" : overallPct < target ? "text-rose-600" : "text-emerald-600")}>
                  {formatPercent(overallPct)}
                  {overallPct != null && <span className="text-3xl">%</span>}
                </p>
                <p className="mt-2 text-[15px] text-slate-600 tabular">
                  {stats.overall.attended} of {stats.overall.held} classes attended
                </p>
              </div>
            </div>
            <div className="card space-y-2 p-5 md:col-span-7">
              <p className="text-lg font-semibold leading-snug text-slate-900">{allowanceText({ ...stats.overall, remaining }, target)}</p>
              <p className="text-sm text-slate-500">
                {checkpoint ? `${checkpoint.label} + ` : ""}classes marked from {formatShort(stats.trackFrom)} · {remaining} classes left this semester
              </p>
              {stats.unmarked > 0 && firstUnmarked && (
                <button type="button" onClick={() => open(firstUnmarked)} className="mt-1 inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2 text-left text-[15px] font-semibold text-amber-800 hover:bg-amber-100">
                  {stats.unmarked} past {stats.unmarked === 1 ? "class is" : "classes are"} not marked. Start from {formatShort(firstUnmarked)} →
                </button>
              )}
            </div>
          </div>

          {/* ─── Calendar + day ──────────────────────────────────────── */}
          <div className="mt-6 grid gap-6 lg:grid-cols-12">
            <div className="card p-4 md:p-5 lg:col-span-7">
              <AttendanceCalendar
                index={index}
                state={state}
                month={month}
                onMonth={setMonth}
                selected={selected}
                onSelect={open}
                today={today}
                trackFrom={stats.trackFrom}
              />
            </div>
            <div id="day-detail" className="scroll-mt-24 lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                <DayDetail
                  day={day}
                  today={today}
                  trackFrom={stats.trackFrom}
                  coveredByCheckpoint={checkpoint?.label ?? null}
                  courses={courseMap}
                  stats={stats.courses}
                  state={state}
                  onMark={(key, status) => setMark(semester.id, key, status)}
                  onMarkAll={(keys, status) => setMarks(semester.id, keys.map((k) => [k, status]))}
                />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => open(addDays(selected, -1))} disabled={selected <= semester.start_date} className="btn-luxe">
                    ← Previous day
                  </button>
                  <button type="button" onClick={() => open(addDays(selected, 1))} disabled={selected >= semester.end_date} className="btn-luxe">
                    Next day →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Subjects ────────────────────────────────────────────── */}
          <section aria-labelledby="subjects-attendance" className="mt-10">
            <div className="mb-4 flex items-baseline justify-between gap-6">
              <h2 id="subjects-attendance" className="text-xl font-bold text-slate-900">
                Subject-wise attendance
              </h2>
              <span className="chip bg-slate-100 text-slate-600">Target {target}%</span>
            </div>
            <AttendanceSummary courses={courses} stats={stats.courses} target={target} />
          </section>

          {/* ─── History ─────────────────────────────────────────────── */}
          <section aria-labelledby="history-title" className="mt-10">
            <div className="mb-4">
              <h2 id="history-title" className="text-xl font-bold text-slate-900">
                Class history
              </h2>
            </div>
            <AttendanceHistory courses={courses} stats={stats.courses} onOpen={open} />
          </section>

          <p className="mt-8 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            Your marks are saved only on this device. Cancelled classes, holidays and future classes are not counted.
          </p>
        </>
      )}
    </div>
  );
}
