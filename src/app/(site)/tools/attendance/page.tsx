import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { ToolGlyph, TOOL_STYLE } from "@/components/tools/ToolGlyph";
import { AttendanceApp } from "@/components/attendance/AttendanceApp";
import { getPublishedSemesterConfigs } from "@/lib/data/attendance";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Attendance Tracker",
  description: "Track your class attendance with your real timetable and holidays. See your % in every subject.",
  alternates: { canonical: "/tools/attendance" },
};

export default async function AttendancePage() {
  const configs = await getPublishedSemesterConfigs();
  return (
    <>
      <PageHeader
        crumbs={[{ href: "/tools", label: "Tools" }, { label: "Attendance" }]}
        tint={TOOL_STYLE.attendance.tint}
        icon={<ToolGlyph slug="attendance" size="lg" solid />}
        title="Attendance Tracker"
        subtitle="Your timetable and holidays are already added. Just mark each class as present or absent."
      />
      <div className="frame py-8">
        <AttendanceApp configs={configs} />
      </div>
    </>
  );
}
