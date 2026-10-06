import type { FieldDef } from "./RecordEditor";
import type { AcademicSection, Subject } from "@/types";
import type { AttendanceCourse, ScheduleSlot } from "@/types/attendance";
import { weekdayName } from "@/lib/attendance/dates";

export const WEEKDAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7].map((d) => ({ value: String(d), label: weekdayName(d) }));
export const CLASS_TYPES = [
  { value: "lecture", label: "Lecture" },
  { value: "lab", label: "Lab" },
  { value: "tutorial", label: "Tutorial" },
  { value: "other", label: "Other" },
];

export function semesterFields(sections: AcademicSection[]): FieldDef[] {
  return [
    { name: "name", label: "Semester name", type: "text", required: true, placeholder: "Semester 1" },
    { name: "academic_year", label: "Academic year", type: "text", required: true, placeholder: "2026–27" },
    { name: "group_label", label: "Programme / section", type: "text", placeholder: "Chemical Engineering · Section L", wide: true },
    { name: "start_date", label: "First day of classes", type: "date", required: true },
    { name: "end_date", label: "Last day of classes", type: "date", required: true },
    {
      name: "section_id",
      label: "Archive section",
      type: "select",
      options: sections.map((s) => ({ value: s.id, label: s.name })),
      hint: "Links this timetable to a section of the archive.",
    },
    { name: "batches", label: "Lab batches", type: "text", placeholder: "L1, L2", hint: "Comma-separated. Students pick theirs." },
    { name: "target_percent", label: "Default target %", type: "number", required: true },
    { name: "display_order", label: "Display order", type: "number" },
    { name: "is_published", label: "Published (visible to students)", type: "checkbox" },
  ];
}

export function courseFields(subjects: Subject[]): FieldDef[] {
  return [
    { name: "code", label: "Course code", type: "text", placeholder: "MAN11101" },
    { name: "name", label: "Course name", type: "text", required: true, placeholder: "Mathematics 1" },
    {
      name: "subject_id",
      label: "Archive subject",
      type: "select",
      options: subjects.map((s) => ({ value: s.id, label: s.name })),
      hint: "Optional link to one of the archive's subjects.",
    },
    { name: "display_order", label: "Display order", type: "number" },
  ];
}

const courseOptions = (courses: AttendanceCourse[]) =>
  courses.map((c) => ({ value: c.id, label: c.code ? `${c.name} · ${c.code}` : c.name }));

const batchField = (batches: string[]): FieldDef =>
  batches.length
    ? { name: "batch", label: "Batch", type: "select", options: batches.map((b) => ({ value: b, label: b })), hint: "Leave empty for the whole section." }
    : { name: "batch", label: "Batch", type: "text", hint: "Leave empty for the whole section." };

export function scheduleFields(courses: AttendanceCourse[], batches: string[]): FieldDef[] {
  return [
    { name: "course_id", label: "Course", type: "select", required: true, options: courseOptions(courses), wide: true },
    { name: "start_time", label: "Starts", type: "time", required: true },
    { name: "end_time", label: "Ends", type: "time", required: true },
    { name: "class_type", label: "Class type", type: "select", required: true, options: CLASS_TYPES },
    { name: "room", label: "Room", type: "text", placeholder: "NLH2" },
    { name: "faculty", label: "Faculty", type: "text" },
    batchField(batches),
  ];
}

export const holidayFields: FieldDef[] = [
  { name: "date", label: "Date", type: "date", required: true },
  { name: "name", label: "Holiday name", type: "text", required: true, placeholder: "Republic Day" },
];

export function specialFields(courses: AttendanceCourse[], batches: string[]): FieldDef[] {
  return [
    { name: "course_id", label: "Course", type: "select", required: true, options: courseOptions(courses), wide: true },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "class_type", label: "Class type", type: "select", required: true, options: CLASS_TYPES },
    { name: "start_time", label: "Starts", type: "time", required: true },
    { name: "end_time", label: "Ends", type: "time", required: true },
    { name: "room", label: "Room", type: "text" },
    batchField(batches),
    { name: "notes", label: "Note for students", type: "text", placeholder: "Extra class", wide: true },
  ];
}

export function overrideFields(slots: ScheduleSlot[], courses: AttendanceCourse[]): FieldDef[] {
  const name = new Map(courses.map((c) => [c.id, c.name]));
  const slotOptions = [...slots]
    .sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))
    .map((s) => ({
      value: s.id,
      label: `${weekdayName(s.day_of_week).slice(0, 3)} ${s.start_time.slice(0, 5)}–${s.end_time.slice(0, 5)} · ${name.get(s.course_id) ?? "?"}${s.batch ? ` · ${s.batch}` : ""}`,
    }));
  return [
    { name: "date", label: "Date", type: "date", required: true },
    {
      name: "action",
      label: "Change",
      type: "select",
      required: true,
      options: [
        { value: "cancel", label: "Cancel a class" },
        { value: "reschedule", label: "Reschedule a class" },
        { value: "follow_weekday", label: "Whole day follows another timetable" },
      ],
    },
    {
      name: "schedule_id",
      label: "Timetable class",
      type: "select",
      options: slotOptions,
      wide: true,
      hint: "Must be a class that normally runs on the date above.",
      showWhen: { field: "action", values: ["cancel", "reschedule"] },
    },
    { name: "new_date", label: "Moves to date", type: "date", showWhen: { field: "action", values: ["reschedule"] } },
    { name: "new_start_time", label: "New start (optional)", type: "time", showWhen: { field: "action", values: ["reschedule"] } },
    { name: "new_end_time", label: "New end (optional)", type: "time", showWhen: { field: "action", values: ["reschedule"] } },
    {
      name: "follow_weekday",
      label: "Runs the timetable of",
      type: "select",
      options: WEEKDAY_OPTIONS,
      hint: "Leave empty if classes are held but the timetable isn't announced yet.",
      showWhen: { field: "action", values: ["follow_weekday"] },
    },
    { name: "notes", label: "Note for students", type: "text", wide: true },
  ];
}

export const checkpointFields: FieldDef[] = [
  { name: "label", label: "Notice", type: "text", required: true, placeholder: "1st Short Attendance Notification", wide: true },
  { name: "as_of_date", label: "Figures as of", type: "date", required: true },
  { name: "resume_date", label: "Tracking resumes on", type: "date", required: true, hint: "First class day counted in the calendar after this notice." },
];
