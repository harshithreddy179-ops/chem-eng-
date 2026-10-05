/**
 * Tool registry. Add an entry (and a route under /tools/<slug>) to ship a
 * new tool — the Tools index renders from this list.
 */
export interface ToolDefinition {
  slug: string;
  name: string;
  summary: string;
  status: "available" | "planned";
}

export const TOOLS: ToolDefinition[] = [
  {
    slug: "pomodoro",
    name: "Pomodoro Timer",
    summary: "Twenty-five minutes of focus, a short pause, repeat. Configurable, keyboard-friendly and quiet.",
    status: "available",
  },
  { slug: "unit-converter", name: "Unit Converter", summary: "Pressure, energy, flow and more.", status: "planned" },
  { slug: "formula-reference", name: "Formula Reference", summary: "The equations you reach for most.", status: "planned" },
  { slug: "gpa-calculator", name: "GPA Calculator", summary: "SPI and CPI, quickly.", status: "planned" },
  { slug: "random-pyq", name: "Random PYQ", summary: "One question, drawn at random.", status: "planned" },
];
