import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Calculator } from "@/components/calculator/Calculator";

export const metadata: Metadata = {
  title: "Scientific Calculator",
  description: "A precise scientific calculator — trigonometry in degrees or radians, logarithms, powers, factorials and scientific notation.",
  alternates: { canonical: "/tools/calculator" },
};

export default function CalculatorPage() {
  return (
    <div className="frame pb-10 pt-32 md:pt-40">
      <Breadcrumbs items={[{ href: "/tools", label: "Tools" }, { label: "Scientific Calculator" }]} />
      <SectionHeading as="h1" size="lg" index="03" eyebrow="Tools" title={["Scientific", "Calculator"]} lede="Calculate precisely." align="split" />
      <div className="mt-16 md:mt-20">
        <Calculator autoFocus />
      </div>
      <p className="mt-10 max-w-2xl font-sans text-xs leading-relaxed text-ivory-500">
        Type freely or use the keys. Brackets close themselves; 2π and 3(4) multiply implicitly; EXP enters scientific notation (1.23E-6).
        The CALC button in the corner of every page opens this same instrument without leaving what you&rsquo;re reading.
      </p>
    </div>
  );
}
