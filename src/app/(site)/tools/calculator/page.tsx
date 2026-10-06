import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { ToolGlyph, TOOL_STYLE } from "@/components/tools/ToolGlyph";
import { Calculator } from "@/components/calculator/Calculator";

export const metadata: Metadata = {
  title: "Scientific Calculator",
  description: "Free scientific calculator: sin, cos, tan in degrees or radians, log, ln, powers, factorials and scientific notation.",
  alternates: { canonical: "/tools/calculator" },
};

export default function CalculatorPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ href: "/tools", label: "Tools" }, { label: "Calculator" }]}
        tint={TOOL_STYLE.calculator.tint}
        icon={<ToolGlyph slug="calculator" size="lg" solid />}
        title="Scientific Calculator"
        subtitle="Type with your keyboard or tap the buttons. Press Enter to get the answer."
      />
      <div className="frame py-8">
        <Calculator autoFocus />
        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-[15px] leading-relaxed text-slate-600">
          <b className="text-slate-800">Tips:</b> brackets close on their own · 2π and 3(4) multiply automatically · EXP is for numbers like 1.23E-6 ·
          the <b className="text-slate-800">Calc</b> button at the bottom corner of every page opens this calculator anywhere.
        </div>
      </div>
    </>
  );
}
