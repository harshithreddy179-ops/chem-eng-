"use client";

import { useState } from "react";
import { AttendanceRecordForm, type FieldDef } from "./RecordEditor";

export function NewSemester({ fields }: { fields: FieldDef[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-10">
      {open ? (
        <AttendanceRecordForm
          table="attendance_semesters"
          semesterId=""
          fields={fields}
          initial={{ target_percent: "85", is_published: "on", display_order: "0" }}
          submitLabel="Create semester"
          onDone={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="btn-solid">
          + New semester
        </button>
      )}
    </div>
  );
}
