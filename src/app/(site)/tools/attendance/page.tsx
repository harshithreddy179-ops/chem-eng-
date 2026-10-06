import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AttendanceApp } from "@/components/attendance/AttendanceApp";
import { getPublishedSemesterConfigs } from "@/lib/data/attendance";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Attendance",
  description: "A semester-aware attendance calendar built on the official timetable and academic calendar. Know where you stand.",
  alternates: { canonical: "/tools/attendance" },
};

export default async function AttendancePage() {
  const configs = await getPublishedSemesterConfigs();
  return (
    <div className="frame pb-10 pt-32 md:pt-40">
      <Breadcrumbs items={[{ href: "/tools", label: "Tools" }, { label: "Attendance" }]} />
      <SectionHeading as="h1" size="xl" index="02" eyebrow="Tools" title="Attendance" lede="Know where you stand." align="split" />
      <div className="mt-16 md:mt-20">
        <AttendanceApp configs={configs} />
      </div>
    </div>
  );
}
