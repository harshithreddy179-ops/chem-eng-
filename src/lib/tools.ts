/**
 * Tool registry. Add an entry (and a route under /tools/<slug>) to ship a
 * new tool — the Tools index renders from this list.
 */
export interface ToolDefinition {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  status: "available" | "planned";
}

export const TOOLS: ToolDefinition[] = [
  {
    slug: "pomodoro",
    name: "Study Timer",
    tagline: "Pomodoro focus timer",
    summary: "Study for 25 minutes, take a 5 minute break, repeat. You can change the times.",
    status: "available",
  },
  {
    slug: "attendance",
    name: "Attendance",
    tagline: "Track your attendance",
    summary: "Mark each class as present or absent. See your % in every subject and how many classes you can still miss.",
    status: "available",
  },
  {
    slug: "calculator",
    name: "Scientific Calculator",
    tagline: "sin, cos, log and more",
    summary: "A full scientific calculator. Also opens from the Calc button on every page.",
    status: "available",
  },
  { slug: "unit-converter", name: "Unit Converter", tagline: "", summary: "Convert pressure, energy, flow and more.", status: "planned" },
  { slug: "formula-reference", name: "Formula Reference", tagline: "", summary: "All important formulas in one place.", status: "planned" },
  { slug: "gpa-calculator", name: "GPA Calculator", tagline: "", summary: "Calculate your SPI and CPI.", status: "planned" },
];
