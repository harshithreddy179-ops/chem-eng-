"use client";

import type { CourseStats, DayInfo } from "@/lib/attendance/engine";
import { formatPercent, whatIf } from "@/lib/attendance/engine";
import { formatLong, formatShort, weekday, weekdayName } from "@/lib/attendance/dates";
import type { AttendanceCourse, ISODate, MarkStatus, StudentSemesterState } from "@/types/attendance";
import { StatusControl } from "./StatusControl";
import { cn } from "@/lib/utils";

const TYPE_LABEL = { lecture: "Lecture", lab: "Lab", tutorial: "Tutorial", other: "Class" } as const;

interface Props {
  day: DayInfo;
  today: ISODate;
  trackFrom: ISODate;
  coveredByCheckpoint: string | null;
  courses: Map<string, AttendanceCourse>;
  stats: Map<string, CourseStats>;
  state: StudentSemesterState;
  onMark: (key: string, status: MarkStatus | null) => void;
  onMarkAll: (keys: string[], status: MarkStatus) => void;
}

export function DayDetail({ day, today, trackFrom, coveredByCheckpoint, courses, stats, state, onMark, onMarkAll }: Props) {
  const future = day.date > today;
  const isToday = day.date === today;
  const covered = day.date < trackFrom && day.kind !== "outside";
  const markable = day.occurrences.filter((o) => !o.cancelledByAdmin);
  const unmarked = markable.filter((o) => !state.marks[o.key]).map((o) => o.key);

  const tag = day.kind === "outside"
    ? "Outside the semester"
    : day.kind === "holiday"
      ? "Holiday"
      : covered
        ? "Already counted"
        : isToday
          ? "Today"
          : future
            ? "Upcoming"
            : markable.length && unmarked.length === 0
              ? "Recorded"
              : markable.length
                ? "Not marked yet"
                : "No classes";

  const tagTone =
    day.kind === "holiday"
      ? "bg-rose-50 text-rose-700"
      : isToday
        ? "bg-brand-50 text-brand-700"
        : tag === "Recorded"
          ? "bg-emerald-50 text-emerald-700"
          : tag === "Not marked yet"
            ? "bg-amber-50 text-amber-700"
            : "bg-slate-100 text-slate-600";

  return (
    <section key={day.date} aria-label={`Classes on ${formatLong(day.date)}`} className="card overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-line bg-slate-50/70 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{weekdayName(weekday(day.date))}</p>
          <p className="text-2xl font-bold text-slate-900">
            {Number(day.date.slice(8))} {formatShort(day.date).split(" ")[1]}
          </p>
        </div>
        <span className={cn("chip", tagTone)}>{tag}</span>
      </div>

      <div className="px-5 py-4">
        {day.kind === "holiday" && (
          <div className="rounded-xl bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-600">Holiday</p>
            <p className="text-xl font-bold text-rose-800">{day.holiday}</p>
            {day.occurrences.length === 0 && <p className="mt-1 text-[15px] text-rose-700">No classes today. Nothing counts for attendance.</p>}
          </div>
        )}

        {day.kind === "tba" && (
          <p className="rounded-xl bg-amber-50 p-4 text-[15px] text-amber-800">
            {day.note ? `${day.note}. ` : ""}There are classes today, but which day&rsquo;s timetable will run hasn&rsquo;t been announced yet.
          </p>
        )}

        {day.followsWeekday && (
          <p className="mb-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
            {day.note ? `${day.note} · ` : ""}Today follows the {weekdayName(day.followsWeekday)} timetable
          </p>
        )}

        {(day.kind === "no-class" || day.kind === "outside") && (
          <p className="py-6 text-center text-[15px] text-slate-500">{day.kind === "outside" ? "This date is outside the semester." : "No classes on this day."}</p>
        )}

        {covered && day.occurrences.length > 0 && (
          <p className="mb-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {coveredByCheckpoint
              ? `Already counted in your ${coveredByCheckpoint} numbers. You mark classes from ${formatShort(trackFrom)}.`
              : `You mark classes from ${formatShort(trackFrom)}.`}
          </p>
        )}

        {day.occurrences.length > 0 && (
          <ol className="divide-y divide-line">
            {day.occurrences.map((o) => {
              const course = courses.get(o.courseId);
              const s = stats.get(o.courseId);
              const mark = state.marks[o.key];
              const prediction = s && future && !o.cancelledByAdmin ? whatIf(s) : null;
              return (
                <li key={o.key} className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="chip bg-brand-50 text-brand-700 tabular">
                      {o.start} – {o.end}
                    </span>
                    <span className="text-sm text-slate-500">
                      {[TYPE_LABEL[o.classType], o.room, o.batch && `Batch ${o.batch}`].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                  <p className={cn("mt-2 text-lg font-bold leading-snug text-slate-900", o.cancelledByAdmin && "text-slate-400 line-through")}>{course?.name ?? "Class"}</p>
                  {(course?.code || o.note) && (
                    <p className="text-sm text-slate-500">
                      {[course?.code, o.source !== "timetable" || o.cancelledByAdmin ? o.note : null].filter(Boolean).join(" · ")}
                    </p>
                  )}

                  {o.cancelledByAdmin ? (
                    <p className="mt-2 text-sm font-semibold text-slate-500">Cancelled by the department · not counted</p>
                  ) : covered ? null : (
                    <div className="mt-3">
                      <StatusControl value={mark} onChange={(v) => onMark(o.key, v)} label={`${course?.name ?? "Class"} at ${o.start}`} planned={future} />
                      {future && mark && mark !== "cancelled" && <p className="mt-2 text-sm text-slate-500">Planned. It counts once the day is over.</p>}
                      {prediction && (
                        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                          <Prediction label="Now" value={prediction.current} />
                          <Prediction label="If you go" value={prediction.ifAttend} tone="up" />
                          <Prediction label="If you miss" value={prediction.ifMiss} tone="down" />
                        </dl>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        {!future && !covered && unmarked.length > 1 && (
          <button type="button" className="btn-solid mt-2 w-full" onClick={() => onMarkAll(unmarked, "present")}>
            Mark all remaining as present
          </button>
        )}
      </div>
    </section>
  );
}

function Prediction({ label, value, tone }: { label: string; value: number | null; tone?: "up" | "down" }) {
  return (
    <div className={cn("rounded-xl px-2 py-2", tone === "up" ? "bg-emerald-50" : tone === "down" ? "bg-rose-50" : "bg-slate-50")}>
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className={cn("text-xl font-bold tabular", tone === "up" ? "text-emerald-600" : tone === "down" ? "text-rose-600" : "text-slate-900")}>
        {formatPercent(value)}
        {value != null && <span className="text-sm">%</span>}
      </dd>
    </div>
  );
}
