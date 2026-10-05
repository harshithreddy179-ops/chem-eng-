import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PomodoroTimer } from "@/components/tools/PomodoroTimer";

export const metadata: Metadata = {
  title: "Pomodoro Timer",
  description: "A calm, configurable focus timer — 25 minutes of focus, 5 minute breaks, 15 minute rests.",
  alternates: { canonical: "/tools/pomodoro" },
};

export default function PomodoroPage() {
  return (
    <div className="frame pb-10 pt-32 md:pt-40">
      <Breadcrumbs items={[{ href: "/tools", label: "Tools" }, { label: "Pomodoro" }]} />
      <h1 className="sr-only">Pomodoro timer</h1>
      <PomodoroTimer />
    </div>
  );
}
