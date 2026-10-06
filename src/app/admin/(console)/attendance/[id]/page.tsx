import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getTaxonomy } from "@/lib/data/admin";
import { loadSemesterConfigs } from "@/lib/data/attendance";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RecordEditor, type EditorRow } from "@/components/admin/attendance/RecordEditor";
import { SemesterSettings } from "@/components/admin/attendance/SemesterSettings";
import {
  checkpointFields,
  courseFields,
  holidayFields,
  overrideFields,
  scheduleFields,
  semesterFields,
  specialFields,
} from "@/components/admin/attendance/fields";
import { formatLong, formatShort, hhmm, weekdayName } from "@/lib/attendance/dates";
import { cn } from "@/lib/utils";

export const metadata = { title: "Attendance · Semester" };

const TABS = [
  ["settings", "Semester"],
  ["courses", "Courses"],
  ["timetable", "Weekly timetable"],
  ["holidays", "Holidays"],
  ["special", "Special classes"],
  ["overrides", "Date changes"],
  ["checkpoints", "Attendance notices"],
] as const;

const TYPE = { lecture: "Lecture", lab: "Lab", tutorial: "Tutorial", other: "Other" } as const;

const Line = ({ main, meta }: { main: React.ReactNode; meta?: React.ReactNode }) => (
  <div>
    <p className="font-sans text-sm text-ivory">{main}</p>
    {meta && <p className="mt-1 font-sans text-[0.6rem] uppercase tracking-[0.18em] text-ivory-500">{meta}</p>}
  </div>
);

export default async function SemesterAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ id }, { tab = "settings" }] = await Promise.all([params, searchParams]);
  const { supabase } = await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [configs, { sections, subjects }] = await Promise.all([loadSemesterConfigs(supabase, false), getTaxonomy(supabase)]);
  const config = configs.find((c) => c.semester.id === id);
  if (!config) notFound();

  const { semester, courses, schedule, holidays, specials, overrides, checkpoints } = config;
  const courseName = new Map(courses.map((c) => [c.id, c.code ? `${c.name} · ${c.code}` : c.name]));
  const slotById = new Map(schedule.map((s) => [s.id, s]));
  const v = (x: unknown) => (x == null ? "" : String(x));

  let body: React.ReactNode = null;
  if (tab === "settings") {
    body = (
      <SemesterSettings
        id={semester.id}
        fields={semesterFields(sections)}
        initial={{
          name: semester.name,
          academic_year: semester.academic_year,
          group_label: v(semester.group_label),
          start_date: semester.start_date,
          end_date: semester.end_date,
          section_id: v(semester.section_id),
          batches: semester.batches.join(", "),
          target_percent: v(semester.target_percent),
          display_order: v(semester.display_order),
          is_published: semester.is_published ? "on" : "",
        }}
      />
    );
  } else if (tab === "courses") {
    body = (
      <RecordEditor
        table="attendance_courses"
        semesterId={id}
        fields={courseFields(subjects)}
        addLabel="Add course"
        defaults={{ display_order: String(courses.length + 1) }}
        empty="No courses yet. Add every course on the timetable first."
        rows={courses.map<EditorRow>((c) => ({
          id: c.id,
          values: { code: v(c.code), name: c.name, subject_id: v(c.subject_id), display_order: v(c.display_order) },
          summary: <Line main={c.name} meta={[c.code, subjects.find((s) => s.id === c.subject_id)?.name].filter(Boolean).join(" · ")} />,
        }))}
      />
    );
  } else if (tab === "timetable") {
    body =
      courses.length === 0 ? (
        <p className="font-display text-xl italic text-ivory-400">Add the courses first, then build the timetable.</p>
      ) : (
        <div className="space-y-14">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <section key={day} aria-label={weekdayName(day)}>
              <h2 className="mb-3 font-display text-3xl font-light uppercase">{weekdayName(day)}</h2>
              <RecordEditor
                table="attendance_schedule"
                semesterId={id}
                fields={scheduleFields(courses, semester.batches)}
                fixed={{ day_of_week: String(day) }}
                defaults={{ class_type: "lecture" }}
                addLabel="Add class"
                empty="No classes."
                rows={schedule
                  .filter((s) => s.day_of_week === day)
                  .map<EditorRow>((s) => ({
                    id: s.id,
                    values: {
                      course_id: s.course_id,
                      start_time: hhmm(s.start_time),
                      end_time: hhmm(s.end_time),
                      class_type: s.class_type,
                      room: v(s.room),
                      faculty: v(s.faculty),
                      batch: v(s.batch),
                    },
                    summary: (
                      <Line
                        main={
                          <>
                            <span className="mr-4 tabular text-ivory-400">
                              {hhmm(s.start_time)}–{hhmm(s.end_time)}
                            </span>
                            {courseName.get(s.course_id)}
                          </>
                        }
                        meta={[TYPE[s.class_type], s.room, s.faculty, s.batch && `Batch ${s.batch}`].filter(Boolean).join(" · ")}
                      />
                    ),
                  }))}
              />
            </section>
          ))}
        </div>
      );
  } else if (tab === "holidays") {
    body = (
      <RecordEditor
        table="attendance_holidays"
        semesterId={id}
        fields={holidayFields}
        addLabel="Add holiday"
        empty="No holidays."
        rows={holidays.map<EditorRow>((h) => ({
          id: h.id,
          values: { date: h.date, name: h.name },
          summary: <Line main={<span className="text-garnet-300">{h.name}</span>} meta={formatLong(h.date)} />,
        }))}
      />
    );
  } else if (tab === "special") {
    body = (
      <RecordEditor
        table="attendance_special_classes"
        semesterId={id}
        fields={specialFields(courses, semester.batches)}
        addLabel="Add special class"
        defaults={{ class_type: "lecture" }}
        empty="No special classes. Use these for extra lectures — including on Saturdays or holidays."
        rows={specials.map<EditorRow>((s) => ({
          id: s.id,
          values: {
            course_id: s.course_id,
            date: s.date,
            start_time: hhmm(s.start_time),
            end_time: hhmm(s.end_time),
            class_type: s.class_type,
            room: v(s.room),
            batch: v(s.batch),
            notes: v(s.notes),
          },
          summary: (
            <Line
              main={`${formatShort(s.date)} · ${hhmm(s.start_time)}–${hhmm(s.end_time)} · ${courseName.get(s.course_id)}`}
              meta={[TYPE[s.class_type], s.room, s.batch && `Batch ${s.batch}`, s.notes].filter(Boolean).join(" · ")}
            />
          ),
        }))}
      />
    );
  } else if (tab === "overrides") {
    body = (
      <>
        <p className="mb-8 max-w-2xl font-display text-lg italic leading-snug text-ivory-400">
          Changes for a single date. They take precedence over the weekly timetable: cancel one class, move it to another day, or make a whole day
          (e.g. a working Saturday) run another weekday&rsquo;s timetable.
        </p>
        <RecordEditor
          table="attendance_overrides"
          semesterId={id}
          fields={overrideFields(schedule, courses)}
          addLabel="Add date change"
          defaults={{ action: "cancel" }}
          empty="No date changes."
          rows={overrides.map<EditorRow>((o) => {
            const slot = o.schedule_id ? slotById.get(o.schedule_id) : undefined;
            const what =
              o.action === "follow_weekday"
                ? o.follow_weekday
                  ? `Runs the ${weekdayName(o.follow_weekday)} timetable`
                  : "Classes held — timetable not set yet"
                : `${o.action === "cancel" ? "Cancelled" : "Rescheduled"}: ${slot ? `${hhmm(slot.start_time)} ${courseName.get(slot.course_id)}` : "class"}${
                    o.action === "reschedule" && o.new_date ? ` → ${formatShort(o.new_date)}${o.new_start_time ? ` ${hhmm(o.new_start_time)}` : ""}` : ""
                  }`;
            return {
              id: o.id,
              values: {
                date: o.date,
                action: o.action,
                schedule_id: v(o.schedule_id),
                new_date: v(o.new_date),
                new_start_time: o.new_start_time ? hhmm(o.new_start_time) : "",
                new_end_time: o.new_end_time ? hhmm(o.new_end_time) : "",
                follow_weekday: v(o.follow_weekday),
                notes: v(o.notes),
              },
              summary: (
                <Line
                  main={
                    <>
                      <span className="mr-4 text-ivory-400">{formatLong(o.date)}</span>
                      <span className={cn(o.action === "follow_weekday" && !o.follow_weekday && "text-bronze-300")}>{what}</span>
                    </>
                  }
                  meta={o.notes ?? undefined}
                />
              ),
            };
          })}
        />
      </>
    );
  } else if (tab === "checkpoints") {
    body = (
      <>
        <p className="mb-8 max-w-2xl font-display text-lg italic leading-snug text-ivory-400">
          Official attendance notices. Students copy their figures from a notice; the calendar counts classes from the resume date onward.
        </p>
        <RecordEditor
          table="attendance_checkpoints"
          semesterId={id}
          fields={checkpointFields}
          addLabel="Add notice"
          empty="No notices — students will track from the first day."
          rows={checkpoints.map<EditorRow>((c) => ({
            id: c.id,
            values: { label: c.label, as_of_date: c.as_of_date, resume_date: c.resume_date },
            summary: <Line main={c.label} meta={`Figures as of ${formatShort(c.as_of_date)} · tracking resumes ${formatShort(c.resume_date)}`} />,
          }))}
        />
      </>
    );
  } else notFound();

  return (
    <>
      <Link href="/admin/attendance" className="eyebrow hover:text-ivory">
        ← Attendance
      </Link>
      <div className="mt-6">
        <AdminPageHeader
          eyebrow={semester.group_label ?? "Semester"}
          title={`${semester.name} · ${semester.academic_year}`}
          description={`${formatLong(semester.start_date)} – ${formatLong(semester.end_date)}`}
        />
      </div>
      <nav aria-label="Semester sections" className="-mx-5 mb-10 overflow-x-auto border-b border-line px-5 scrollbar-none sm:mx-0 sm:px-0">
        <ul className="flex min-w-max gap-7">
          {TABS.map(([key, label]) => (
            <li key={key}>
              <Link
                href={`/admin/attendance/${id}?tab=${key}`}
                aria-current={tab === key ? "page" : undefined}
                className={cn(
                  "relative block pb-4 font-sans text-[0.65rem] uppercase tracking-[0.22em] transition-colors",
                  tab === key ? "text-ivory" : "text-ivory-500 hover:text-ivory-200",
                )}
              >
                {label}
                {tab === key && <span className="absolute -bottom-px left-0 h-px w-full bg-bronze" />}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="max-w-5xl">{body}</div>
    </>
  );
}
