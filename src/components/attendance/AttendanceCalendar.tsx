"use client";

import { motion, useReducedMotion } from "framer-motion";
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
  const reduce = useReducedMotion();
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
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div aria-live="polite" className="min-w-0">
            <motion.h2
              key={month}
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0.1 : 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[2.6rem] font-light uppercase leading-none sm:text-5xl md:text-7xl"
            >
              {monthName(month)} <span className="italic text-ivory-400">{month.slice(0, 4)}</span>
            </motion.h2>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onMonth(addMonths(month, -1))}
            disabled={month <= firstMonth}
            aria-label="Previous month"
            className="grid h-10 w-10 place-items-center border border-line text-ivory-300 transition-colors hover:border-ivory/30 hover:text-ivory disabled:opacity-25"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.25} />
          </button>
          <button
            type="button"
            onClick={() => {
              onMonth(todayMonth);
              onSelect(today);
            }}
            disabled={!canToday}
            className="h-10 border border-line px-4 font-sans text-[0.6rem] uppercase tracking-[0.24em] text-ivory-300 transition-colors hover:border-ivory/30 hover:text-ivory disabled:opacity-25"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => onMonth(addMonths(month, 1))}
            disabled={month >= lastMonth}
            aria-label="Next month"
            className="grid h-10 w-10 place-items-center border border-line text-ivory-300 transition-colors hover:border-ivory/30 hover:text-ivory disabled:opacity-25"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.25} />
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-7 border-b border-line pb-3" aria-hidden>
        {HEAD.map((h, i) => (
          <span key={h} className={cn("text-center font-sans text-[0.58rem] uppercase tracking-[0.26em]", i >= 5 ? "text-ivory-500" : "text-ivory-400")}>
            {h}
          </span>
        ))}
      </div>

      <div role="grid" aria-label={`${monthName(month)} ${month.slice(0, 4)}`} className="grid grid-cols-7">
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
            <span key={`pad-${i}`} className="border-b border-line" aria-hidden />
          ),
        )}
      </div>

      <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-sans text-[0.58rem] uppercase tracking-[0.2em] text-ivory-500">
        <Legend swatch={<span className="h-1 w-3 bg-bronze" />} label="Present" />
        <Legend swatch={<span className="h-1 w-3 border border-ivory/70" />} label="Absent" />
        <Legend swatch={<span className="h-px w-3 bg-ivory/40" />} label="Cancelled" />
        <Legend swatch={<span className="h-1 w-3 bg-ivory/15" />} label="Not marked / upcoming" />
        <Legend swatch={<span className="font-display text-sm normal-case tracking-normal text-garnet">12</span>} label="Holiday" />
      </dl>
    </section>
  );
}

function Legend({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
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
      className={cn(
        "group relative flex aspect-[1/1.05] flex-col items-start justify-between border-b border-line p-1.5 text-left transition-colors duration-500 sm:aspect-[1/0.95] sm:p-3",
        outside ? "cursor-default opacity-25" : "hover:bg-ivory/[0.03]",
        selected && "bg-ivory/[0.05]",
      )}
    >
      {selected && <span aria-hidden className="absolute inset-0 border border-ivory/40" />}
      <span className="flex w-full items-start justify-between gap-1">
        <span
          className={cn(
            "relative font-display text-xl leading-none tabular sm:text-3xl",
            holiday ? "text-garnet" : future && !today ? "text-ivory/55" : "text-ivory",
            (info.kind === "no-class" || covered) && !holiday && "text-ivory/35",
          )}
        >
          {n}
          {today && <span aria-hidden className="absolute -bottom-1.5 left-0 h-px w-full bg-bronze" />}
        </span>
        {info.followsWeekday || info.kind === "tba" ? (
          <span className="hidden font-sans text-[0.5rem] uppercase tracking-[0.16em] text-bronze-300 sm:block">
            {info.kind === "tba" ? "TBA" : `as ${weekdayShort(info.followsWeekday!)}`}
          </span>
        ) : null}
      </span>

      {holiday ? (
        <span className="line-clamp-2 w-full font-sans text-[0.5rem] uppercase leading-tight tracking-[0.12em] text-garnet/90 sm:text-[0.55rem]">
          {info.holiday}
        </span>
      ) : info.kind === "tba" ? (
        <span className="font-sans text-[0.5rem] uppercase tracking-[0.14em] text-ivory-500 sm:hidden">TBA</span>
      ) : null}

      {bars.length > 0 && (
        <span className="flex w-full flex-wrap gap-[3px]" aria-hidden>
          {bars.map((o) => {
            const mark = state.marks[o.key];
            return (
              <span
                key={o.key}
                className={cn(
                  "h-[3px] w-2 sm:h-1 sm:w-3",
                  o.cancelledByAdmin || mark === "cancelled"
                    ? "mt-[1px] h-px bg-ivory/40 sm:h-px"
                    : mark === "present"
                      ? future
                        ? "bg-bronze/50"
                        : "bg-bronze"
                      : mark === "absent"
                        ? "border border-ivory/70"
                        : covered
                          ? "bg-ivory/[0.07]"
                          : "bg-ivory/15",
                )}
              />
            );
          })}
        </span>
      )}
    </button>
  );
}
