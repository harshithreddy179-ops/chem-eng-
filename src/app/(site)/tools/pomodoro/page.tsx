import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { ToolGlyph, TOOL_STYLE } from "@/components/tools/ToolGlyph";
import { PomodoroTimer } from "@/components/tools/PomodoroTimer";

export const metadata: Metadata = {
  title: "Study Timer (Pomodoro)",
  description: "Pomodoro study timer: 25 minutes of focus, 5 minute short breaks, 15 minute long breaks.",
  alternates: { canonical: "/tools/pomodoro" },
};

export default function PomodoroPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ href: "/tools", label: "Tools" }, { label: "Study Timer" }]}
        tint={TOOL_STYLE.pomodoro.tint}
        icon={<ToolGlyph slug="pomodoro" size="lg" solid />}
        title="Study Timer"
        subtitle="Study for 25 minutes, then take a short break. After 4 rounds, take a longer break."
      />
      <div className="frame py-8">
        <PomodoroTimer />
      </div>
    </>
  );
}
