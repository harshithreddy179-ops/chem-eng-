import { cn } from "@/lib/utils";

/**
 * Line-drawn, subject-specific motifs. Pure SVG — rendered on the server,
 * animated with CSS on hover via the parent's `group` class.
 */

type MotifProps = { className?: string };

const STROKE = { fill: "none", stroke: "currentColor", vectorEffect: "non-scaling-stroke" as const };

function ProcessFlow() {
  // Units connected by streams: a flowsheet.
  return (
    <g {...STROKE}>
      <rect x="40" y="90" width="70" height="110" />
      <circle cx="210" cy="145" r="42" />
      <rect x="300" y="60" width="44" height="200" rx="22" />
      <path d="M110 145 H168 M252 145 H300 M344 100 H380 M344 220 H380" />
      <path d="M75 90 V40 H322 V60" strokeDasharray="3 5" />
      <path d="M180 120 l30 25 l30 -25" />
      {[90, 120, 150, 180, 210, 240].map((y) => (
        <path key={y} d={`M300 ${y} H344`} strokeOpacity="0.5" />
      ))}
      <path d="M210 187 V300 H75 V200" />
      <path d="M20 145 H40" />
      <circle cx="75" cy="300" r="4" />
    </g>
  );
}

function Mathematics() {
  const curve = Array.from({ length: 81 }, (_, i) => {
    const x = 30 + i * 4.5;
    const y = 160 - Math.sin(i / 9) * 70 * Math.exp(-i / 90);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return (
    <g {...STROKE}>
      {Array.from({ length: 9 }, (_, i) => (
        <path key={`v${i}`} d={`M${30 + i * 45} 40 V300`} strokeOpacity="0.25" />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <path key={`h${i}`} d={`M30 ${40 + i * 43} H390`} strokeOpacity="0.25" />
      ))}
      <path d="M30 160 H390 M30 40 V300" />
      <path d={curve} strokeWidth="1.5" />
      {Array.from({ length: 12 }, (_, i) => {
        const x = 75 + i * 6;
        const y = 160 - Math.sin((x - 30) / 4.5 / 9) * 70 * Math.exp(-(x - 30) / 4.5 / 90);
        return <path key={`a${i}`} d={`M${x} 160 V${y.toFixed(1)}`} strokeOpacity="0.55" />;
      })}
      <circle cx="210" cy="160" r="3" />
    </g>
  );
}

function Chemistry() {
  const hex = (cx: number, cy: number, r: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return `${i === 0 ? "M" : "L"}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
    }).join(" ") + " Z";
  const r = 42;
  const w = Math.sqrt(3) * r;
  const cells: [number, number][] = [];
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 4; col++) cells.push([60 + col * w + (row % 2 ? w / 2 : 0), 70 + row * r * 1.5]);
  return (
    <g {...STROKE}>
      {cells.map(([x, y], i) => (
        <path key={i} d={hex(x, y, r)} strokeOpacity={i === 5 || i === 6 ? 1 : 0.35} />
      ))}
      <circle cx={cells[5][0]} cy={cells[5][1]} r={r * 0.55} />
      <path d={hex(cells[6][0], cells[6][1], r * 0.72)} />
    </g>
  );
}

function Communication() {
  return (
    <g {...STROKE}>
      {Array.from({ length: 7 }, (_, i) => {
        const r = 30 + i * 20;
        return <path key={i} d={`M110 ${170 - r} A ${r} ${r} 0 0 1 110 ${170 + r}`} strokeOpacity={1 - i * 0.12} />;
      })}
      <circle cx="110" cy="170" r="6" />
      {Array.from({ length: 22 }, (_, i) => {
        const h = 8 + Math.abs(Math.sin(i * 1.7) * 50) + (i % 3) * 6;
        return <path key={`w${i}`} d={`M${250 + i * 7} ${170 - h / 2} V${170 + h / 2}`} strokeOpacity="0.6" />;
      })}
    </g>
  );
}

function Thermodynamics() {
  // Isotherms (PV = const) with a Carnot cycle traced over them.
  const iso = (k: number) =>
    Array.from({ length: 50 }, (_, i) => {
      const v = 0.6 + i * 0.1;
      const x = 30 + v * 60;
      const y = 300 - (k / v) * 1;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${Math.max(30, y).toFixed(1)}`;
    }).join(" ");
  return (
    <g {...STROKE}>
      <path d="M30 30 V300 H400" />
      {[60, 100, 140, 180].map((k, i) => (
        <path key={k} d={iso(k)} strokeOpacity={0.25 + i * 0.12} />
      ))}
      <path d="M110 120 C 170 150, 230 170, 290 180 C 300 220, 310 250, 330 262 C 270 255, 200 245, 140 225 C 130 190, 122 150, 110 120 Z" strokeWidth="1.5" />
      {[[110, 120], [290, 180], [330, 262], [140, 225]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="3.5" />
      ))}
    </g>
  );
}

function Environment() {
  // Topographic contours.
  const ring = (s: number, seed: number) =>
    Array.from({ length: 37 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 36;
      const rr = s * (1 + 0.14 * Math.sin(a * 3 + seed) + 0.08 * Math.cos(a * 5 + seed * 2));
      return `${i === 0 ? "M" : "L"}${(215 + rr * Math.cos(a) * 1.25).toFixed(1)} ${(170 + rr * Math.sin(a)).toFixed(1)}`;
    }).join(" ");
  return (
    <g {...STROKE}>
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={ring(16 + i * 15, i * 0.35)} strokeOpacity={0.25 + (i % 3 === 0 ? 0.5 : 0)} />
      ))}
      <circle cx="215" cy="170" r="3" />
    </g>
  );
}

function Fallback() {
  return (
    <g {...STROKE}>
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={60 + i * 22} y={30 + i * 22} width={300 - i * 44} height={280 - i * 44} strokeOpacity={1 - i * 0.14} />
      ))}
    </g>
  );
}

const MOTIFS: Record<string, () => React.JSX.Element> = {
  "chemical-process-principles": ProcessFlow,
  mathematics: Mathematics,
  chemistry: Chemistry,
  "professional-communication": Communication,
  "engineering-thermodynamics": Thermodynamics,
  "environment-climate": Environment,
};

export function SubjectMotif({ slug, className }: MotifProps & { slug: string }) {
  const Motif = MOTIFS[slug] ?? Fallback;
  return (
    <svg viewBox="0 0 420 340" className={cn("h-full w-full", className)} aria-hidden focusable="false">
      <Motif />
    </svg>
  );
}
