"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DayInfo, SemesterIndex } from "@/lib/attendance/engine";
import { getDay } from "@/lib/attendance/engine";
import { addMonths, monthGrid, monthName, weekdayShort } from "@/lib/attendance/dates";
import type { ISODate, StudentSemesterState } from "@/types/attendance";
import { cn } from "@/lib/utils";

const HEAD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Props {
  index: SemesterIndex;
  state: StudentSemesterState;
  month: string; // YYYY-MM
  onMonth: (m: string) => void;
  selected: ISODate;
  onSelect: (d: ISODate) => void;
  today: ISODate;
  trackFrom: ISODate;
}

export function AttendanceCalendar({ index, state, month, onMonth, selected, onSelect, today, trackFrom }: Props) {
  const { start_date, end_date } = index.config.semester;
  const firstMonth = start_date.slice(0, 7);
  const lastMonth = end_date.slice(0, 7);

  const days = useMemo(() => {
    const map = new Map<ISODate, DayInfo>();
    for (const d of monthGrid(month)) if (d) map.set(d, getDay(index, d, state.batch));
    return map;
  }, [index, month, state.batch]);

  const grid = monthGrid(month);
  const todayMonth = today.slice(0, 7);
  const canToday = todayMonth >= firstMonth && todayMonth <= lastMonth;

  return (
    <section aria-label="Attendance calendar">
      <div className="flex items-center justify-between gap-3">
        <h2 aria-live="polite" className="text-2xl font-bold text-slate-900">
          {monthName(month)} <span className="text-slate-500">{month.slice(0, 4)}</span>
        </h2>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => onMonth(addMonths(month, -1))}
            disabled={month <= firstMonth}
            aria-label="Previous month"
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              onMonth(todayMonth);
              onSelect(today);
            }}
            disabled={!canToday}
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-30"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => onMonth(addMonths(month, 1))}
            disabled={month >= lastMonth}
            aria-label="Next month"
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1.5 pb-2" aria-hidden>
        {HEAD.map((h, i) => (
          <span key={h} className={cn("text-center text-sm font-semibold", i === 6 ? "text-rose-500" : "text-slate-500")}>
            {h}
          </span>
        ))}
      </div>

      <div role="grid" aria-label={`${monthName(month)} ${month.slice(0, 4)}`} className="grid grid-cols-7 gap-1.5">
        {grid.map((d, i) =>
          d ? (
            <DayCell
              key={d}
              info={days.get(d)!}
              state={state}
              selected={d === selected}
              today={d === today}
              future={d > today}
              covered={d < trackFrom}
              onSelect={onSelect}
            />
          ) : (
            <span key={`pad-${i}`} aria-hidden />
          ),
        )}
      </div>

      <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
        <Legend swatch={<span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />} label="Present" />
        <Legend swatch={<span className="h-2.5 w-2.5 rounded-full bg-rose-500" />} label="Absent" />
        <Legend swatch={<span className="h-2.5 w-2.5 rounded-full bg-slate-400" />} label="Cancelled" />
        <Legend swatch={<span className="h-2.5 w-2.5 rounded-full border-2 border-slate-300 bg-white" />} label="Not marked" />
        <Legend swatch={<span className="h-3 w-3 rounded bg-rose-100 ring-1 ring-rose-200" />} label="Holiday" />
      </dl>
    </section>
  );
}

function Legend({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <dt className="flex items-center">{swatch}</dt>
      <dd>{label}</dd>
    </div>
  );
}

function DayCell({
  info,
  state,
  selected,
  today,
  future,
  covered,
  onSelect,
}: {
  info: DayInfo;
  state: StudentSemesterState;
  selected: boolean;
  today: boolean;
  future: boolean;
  covered: boolean;
  onSelect: (d: ISODate) => void;
}) {
  const n = Number(info.date.slice(8));
  const outside = info.kind === "outside";
  const holiday = info.kind === "holiday";
  const bars = info.occurrences.slice(0, 8);
  const label = [
    info.date,
    holiday ? `Holiday: ${info.holiday}` : null,
    info.kind === "tba" ? "Classes, timetable not announced" : null,
    info.occurrences.length ? `${info.occurrences.length} classes` : null,
    today ? "Today" : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <button
      type="button"
      role="gridcell"
      aria-selected={selected}
      aria-label={label}
      aria-current={today ? "date" : undefined}
      disabled={outside}
      onClick={() => onSelect(info.date)}
      title={holiday ? info.holiday ?? undefined : undefined}
      className={cn(
        "relative flex aspect-square flex-col items-center justify-between rounded-xl border p-1 text-center transition sm:aspect-[1/0.9] sm:p-1.5",
        outside && "cursor-default border-transparent opacity-30",
        !outside && !selected && (holiday ? "border-rose-200 bg-rose-50 hover:bg-rose-100" : "border-slate-100 bg-white hover:border-brand-200 hover:bg-brand-50/50"),
        selected && "border-brand-600 bg-brand-600 text-white shadow-md",
        today && !selected && "ring-2 ring-brand-500 ring-offset-1",
      )}
    >
      <span
        className={cn(
          "text-base font-bold leading-none tabular sm:text-lg",
          selected ? "text-white" : holiday ? "text-rose-600" : (info.kind === "no-class" || covered) ? "text-slate-300" : future ? "text-slate-500" : "text-slate-900",
        )}
      >
        {n}
      </span>
      {holiday ? (
        <span className={cn("line-clamp-1 w-full text-[10px] font-semibold leading-tight sm:text-[11px]", selected ? "text-white/90" : "text-rose-600")}>
          {info.holiday}
        </span>
      ) : info.kind === "tba" ? (
        <span className={cn("text-[10px] font-bold sm:text-[11px]", selected ? "text-white/90" : "text-amber-600")}>TBA</span>
      ) : info.followsWeekday ? (
        <span className={cn("hidden text-[10px] font-bold sm:block sm:text-[11px]", selected ? "text-white/90" : "text-amber-600")}>as {weekdayShort(info.followsWeekday)}</span>
      ) : null}

      {bars.length > 0 && !holiday && (
        <span className="flex flex-wrap justify-center gap-[3px]" aria-hidden>
          {bars.map((o) => {
            const mark = state.marks[o.key];
            const cancelled = o.cancelledByAdmin || mark === "cancelled";
            return (
              <span
                key={o.key}
                className={cn(
                  "h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2",
                  cancelled
                    ? "bg-slate-400"
                    : mark === "present"
                      ? future
                        ? "bg-emerald-300"
                        : "bg-emerald-500"
                      : mark === "absent"
                        ? "bg-rose-500"
                        : covered
                          ? "bg-slate-200"
                          : selected
                            ? "border border-white/80"
                            : "border-[1.5px] border-slate-300 bg-white",
                )}
              />
            );
          })}
        </span>
      )}
    </button>
  );
}
