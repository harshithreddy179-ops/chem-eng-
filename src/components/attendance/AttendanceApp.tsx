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
import { Reveal } from "@/components/motion/Reveal";
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
      <Reveal className="flex flex-wrap items-end gap-x-10 gap-y-6 border-y border-line py-6">
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
            <p className="py-3 font-sans text-sm text-ivory">
              {semester.name} · {semester.academic_year}
              {semester.group_label && <span className="text-ivory-400"> · {semester.group_label}</span>}
            </p>
          </div>
        )}
        {semester.batches.length > 0 && (
          <div>
            <p className="field-label">Lab batch</p>
            <div role="radiogroup" aria-label="Lab batch" className="flex border border-line">
              {[null, ...semester.batches].map((b) => (
                <button
                  key={b ?? "all"}
                  type="button"
                  role="radio"
                  aria-checked={state.batch === b}
                  onClick={() => updateSemester(semester.id, (s) => ({ ...s, batch: b }))}
                  className={cn(
                    "px-4 py-2.5 font-sans text-[0.62rem] uppercase tracking-[0.22em] transition-colors duration-500",
                    state.batch === b ? "bg-ivory text-ink" : "text-ivory-400 hover:text-ivory",
                  )}
                >
                  {b ?? "All"}
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
            className="field font-display text-xl tabular"
            value={target}
            onChange={(e) => {
              const v = Math.min(100, Math.max(1, Number(e.target.value) || semester.target_percent));
              updateSemester(semester.id, (s) => ({ ...s, target: v }));
            }}
          />
        </label>
        {state.start && !editingStart && (
          <button type="button" onClick={() => setEditingStart(true)} className="link-luxe mb-3 text-ivory-400">
            {checkpoint ? "Edit notice figures" : "Change starting point"}
          </button>
        )}
      </Reveal>

      {needsSetup ? (
        <div className="mt-12">
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
          <Reveal className="mt-14 grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-6">
              <p className="eyebrow">Overall attendance</p>
              <p className={cn("mt-4 font-display text-[clamp(5rem,16vw,10rem)] font-light leading-[0.85] tabular", overallPct != null && overallPct < target ? "text-garnet-300" : "text-ivory")}>
                {formatPercent(overallPct)}
                {overallPct != null && <span className="ml-1 align-top text-[0.3em] text-ivory-400">%</span>}
              </p>
              <p className="mt-4 font-sans text-xs uppercase tracking-[0.24em] text-ivory-400 tabular">
                {stats.overall.attended} / {stats.overall.held} classes attended
              </p>
            </div>
            <div className="space-y-3 md:col-span-6">
              <p className="font-display text-xl italic leading-snug text-ivory-200">
                {allowanceText({ ...stats.overall, remaining }, target)}
              </p>
              <p className="font-sans text-[0.62rem] uppercase tracking-[0.2em] text-ivory-500">
                {checkpoint ? `${checkpoint.label} + ` : ""}classes marked from {formatShort(stats.trackFrom)} · {remaining} classes left this semester
              </p>
              {stats.unmarked > 0 && firstUnmarked && (
                <button type="button" onClick={() => open(firstUnmarked)} className="link-luxe text-bronze-300">
                  {stats.unmarked} past {stats.unmarked === 1 ? "class" : "classes"} not marked — start at {formatShort(firstUnmarked)} →
                </button>
              )}
            </div>
          </Reveal>

          {/* ─── Calendar + day ──────────────────────────────────────── */}
          <div className="mt-20 grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
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
            <div id="day-detail" className="scroll-mt-28 lg:col-span-5">
              <div className="lg:sticky lg:top-28">
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
                <div className="mt-4 flex justify-between">
                  <button type="button" onClick={() => open(addDays(selected, -1))} disabled={selected <= semester.start_date} className="link-luxe text-ivory-400 disabled:opacity-30">
                    ← Previous day
                  </button>
                  <button type="button" onClick={() => open(addDays(selected, 1))} disabled={selected >= semester.end_date} className="link-luxe text-ivory-400 disabled:opacity-30">
                    Next day →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Subjects ────────────────────────────────────────────── */}
          <section aria-labelledby="subjects-attendance" className="mt-28">
            <Reveal className="mb-8 flex items-baseline justify-between gap-6">
              <h2 id="subjects-attendance" className="eyebrow">
                <span className="text-bronze">II</span> &nbsp;— &nbsp;By subject
              </h2>
              <span className="eyebrow text-ivory-500">Target {target}%</span>
            </Reveal>
            <AttendanceSummary courses={courses} stats={stats.courses} target={target} />
          </section>

          {/* ─── History ─────────────────────────────────────────────── */}
          <section aria-labelledby="history-title" className="mt-28">
            <Reveal className="mb-8">
              <h2 id="history-title" className="eyebrow">
                <span className="text-bronze">III</span> &nbsp;— &nbsp;History
              </h2>
            </Reveal>
            <AttendanceHistory courses={courses} stats={stats.courses} onOpen={open} />
          </section>

          <p className="mt-20 font-sans text-[0.62rem] uppercase tracking-[0.2em] text-ivory-500">
            Your marks are saved privately on this device. Cancelled classes, holidays and upcoming classes never count.
          </p>
        </>
      )}
    </div>
  );
}
