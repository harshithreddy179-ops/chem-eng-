/** Small line-drawn emblem per tool, animated on hover via the parent group. */
export function ToolGlyph({ slug }: { slug: string }) {
  if (slug === "pomodoro")
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="#b39469"
          strokeWidth="0.9"
          strokeDasharray="276.5"
          strokeDashoffset="69"
          className="transition-[stroke-dashoffset] duration-[1600ms] ease-luxe group-hover:[stroke-dashoffset:0]"
        />
      </svg>
    );
  if (slug === "attendance")
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
        {Array.from({ length: 5 }, (_, r) =>
          Array.from({ length: 7 }, (_, c) => {
            const i = r * 7 + c;
            const held = i < 23;
            const absent = i === 6 || i === 15;
            const holiday = i === 11;
            return (
              <rect
                key={i}
                x={8 + c * 12.4}
                y={18 + r * 14}
                width="8"
                height={absent ? 1.6 : 3}
                fill={holiday ? "#b4665c" : held && !absent ? "#b39469" : "currentColor"}
                opacity={holiday ? 0.9 : held ? 1 : 0.3}
                className="transition-transform duration-700 ease-luxe group-hover:translate-y-[-1px]"
                style={{ transitionDelay: `${i * 12}ms` }}
              />
            );
          }),
        )}
        <line x1="8" x2="92" y1="10" y2="10" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    );
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <text x="50" y="44" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="30" fill="currentColor" opacity="0.9">
        ∫ π √
      </text>
      {Array.from({ length: 3 }, (_, r) =>
        Array.from({ length: 4 }, (_, c) => (
          <rect key={`${r}-${c}`} x={14 + c * 19} y={56 + r * 12} width="15" height="8" fill="none" stroke={r === 2 && c === 3 ? "#b39469" : "currentColor"} strokeWidth="0.6" />
        )),
      )}
    </svg>
  );
}
