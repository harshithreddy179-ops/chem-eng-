"use client";

import { motion, useReducedMotion } from "framer-motion";
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
  const reduce = useReducedMotion();
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
        ? "Before tracking"
        : isToday
          ? "Today"
          : future
            ? "Upcoming"
            : markable.length && unmarked.length === 0
              ? "Recorded"
              : markable.length
                ? "Awaiting your marks"
                : "No classes";

  return (
      <motion.section
        key={day.date}
        aria-label={`Classes on ${formatLong(day.date)}`}
        initial={{ opacity: 0, y: reduce ? 0 : 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0.1 : 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="border border-line p-5 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-sans text-[0.62rem] uppercase tracking-[0.3em] text-ivory-400">{weekdayName(weekday(day.date))}</p>
            <p className="mt-2 font-display text-4xl font-light uppercase leading-none md:text-5xl">
              {String(Number(day.date.slice(8))).padStart(2, "0")}{" "}
              <span className="text-ivory-300">{formatShort(day.date).split(" ")[1]}</span>
            </p>
          </div>
          <span
            className={cn(
              "border px-3 py-1.5 font-sans text-[0.55rem] uppercase tracking-[0.22em]",
              day.kind === "holiday" ? "border-garnet/50 text-garnet-300" : isToday ? "border-bronze/60 text-bronze-300" : "border-line text-ivory-400",
            )}
          >
            {tag}
          </span>
        </div>

        {day.kind === "holiday" && (
          <div className="mt-8 border-t border-line pt-6">
            <p className="font-sans text-[0.62rem] uppercase tracking-[0.3em] text-garnet-300">Holiday</p>
            <p className="mt-2 font-display text-3xl font-light">{day.holiday}</p>
            {day.occurrences.length === 0 && (
              <p className="mt-3 font-display text-lg italic text-ivory-400">No classes — nothing here counts towards attendance.</p>
            )}
          </div>
        )}

        {day.kind === "tba" && (
          <p className="mt-8 border-t border-line pt-6 font-display text-xl italic leading-snug text-ivory-300">
            {day.note ? `${day.note}. ` : ""}Classes are held today, but which timetable runs hasn&rsquo;t been announced yet.
          </p>
        )}

        {day.followsWeekday && (
          <p className="mt-6 font-sans text-[0.62rem] uppercase tracking-[0.24em] text-bronze-300">
            {day.note ? `${day.note} · ` : ""}Follows the {weekdayName(day.followsWeekday)} timetable
          </p>
        )}

        {(day.kind === "no-class" || (day.kind === "outside")) && (
          <p className="mt-8 border-t border-line pt-6 font-display text-xl italic text-ivory-400">
            {day.kind === "outside" ? "This date is outside the semester." : "No classes scheduled."}
          </p>
        )}

        {covered && day.occurrences.length > 0 && (
          <p className="mt-6 font-display text-lg italic leading-snug text-ivory-400">
            {coveredByCheckpoint
              ? `Covered by your figures from the ${coveredByCheckpoint}. Tracking begins ${formatShort(trackFrom)}.`
              : `Tracking begins ${formatShort(trackFrom)}.`}
          </p>
        )}

        {day.occurrences.length > 0 && (
          <ol className="mt-8 border-t border-line">
            {day.occurrences.map((o) => {
              const course = courses.get(o.courseId);
              const s = stats.get(o.courseId);
              const mark = state.marks[o.key];
              const prediction = s && future && !o.cancelledByAdmin ? whatIf(s) : null;
              return (
                <li key={o.key} className="border-b border-line py-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-sans text-xs tabular tracking-[0.18em] text-ivory-400">
                      {o.start} — {o.end}
                    </p>
                    <p className="font-sans text-[0.55rem] uppercase tracking-[0.22em] text-ivory-500">
                      {[TYPE_LABEL[o.classType], o.room, o.batch && `Batch ${o.batch}`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <p className={cn("mt-2 font-display text-2xl font-light leading-tight md:text-[1.7rem]", o.cancelledByAdmin && "text-ivory-500 line-through decoration-1")}>
                    {course?.name ?? "Class"}
                  </p>
                  {(course?.code || o.note) && (
                    <p className="mt-1 font-sans text-[0.6rem] uppercase tracking-[0.2em] text-ivory-500">
                      {[course?.code, o.source !== "timetable" || o.cancelledByAdmin ? o.note : null].filter(Boolean).join(" · ")}
                    </p>
                  )}

                  {o.cancelledByAdmin ? (
                    <p className="mt-4 font-sans text-[0.62rem] uppercase tracking-[0.22em] text-ivory-400">— Cancelled by the department · not counted</p>
                  ) : covered ? null : (
                    <div className="mt-4">
                      <StatusControl
                        value={mark}
                        onChange={(v) => onMark(o.key, v)}
                        label={`${course?.name ?? "Class"} at ${o.start}`}
                        planned={future}
                      />
                      {future && mark && mark !== "cancelled" && (
                        <p className="mt-2 font-sans text-[0.58rem] uppercase tracking-[0.2em] text-ivory-500">
                          Planned — counts once the day has passed
                        </p>
                      )}
                      {prediction && (
                        <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4">
                          <Prediction label="Now" value={prediction.current} />
                          <Prediction label="If you attend" value={prediction.ifAttend} tone="up" />
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
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn-luxe py-3" onClick={() => onMarkAll(unmarked, "present")}>
              Mark the rest present
            </button>
          </div>
        )}
      </motion.section>
  );
}

function Prediction({ label, value, tone }: { label: string; value: number | null; tone?: "up" | "down" }) {
  return (
    <div>
      <dt className="font-sans text-[0.52rem] uppercase tracking-[0.2em] text-ivory-500">{label}</dt>
      <dd className={cn("mt-1 font-display text-2xl tabular", tone === "up" ? "text-bronze-300" : tone === "down" ? "text-ivory-300" : "text-ivory")}>
        {formatPercent(value)}
        {value != null && <span className="text-sm text-ivory-500">%</span>}
      </dd>
    </div>
  );
}
