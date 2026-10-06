"use client";

import { useState } from "react";
import { deleteAttendanceRecord } from "@/actions/attendance";
import { AttendanceRecordForm, type FieldDef } from "./RecordEditor";

export function SemesterSettings({ id, fields, initial }: { id: string; fields: FieldDef[]; initial: Record<string, string> }) {
  const [saved, setSaved] = useState(false);
  return (
    <div>
      {saved && (
        <p role="status" className="mb-6 border border-bronze/40 bg-bronze/10 px-5 py-4 font-sans text-sm text-bronze-300">
          Saved.
        </p>
      )}
      <AttendanceRecordForm
        table="attendance_semesters"
        semesterId={id}
        id={id}
        fields={fields}
        initial={initial}
        submitLabel="Save semester"
        onDone={() => setSaved(true)}
      />
      <form
        action={deleteAttendanceRecord}
        className="mt-12 border-t border-line pt-8"
        onSubmit={(e) => {
          if (!window.confirm("Delete this semester with its whole timetable, holidays and changes? This cannot be undone.")) e.preventDefault();
        }}
      >
        <input type="hidden" name="_table" value="attendance_semesters" />
        <input type="hidden" name="id" value={id} />
        <button type="submit" className="font-sans text-sm text-garnet-300/80 hover:text-garnet-300">
          Delete semester
        </button>
      </form>
    </div>
  );
}
