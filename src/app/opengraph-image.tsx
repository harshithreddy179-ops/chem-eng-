import { ImageResponse } from "next/og";

export const alt = "The Chemical Archive — MNNIT Allahabad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CHIPS = [
  { t: "Study Material", bg: "#eef4ff", c: "#1c45c9" },
  { t: "PYQs", bg: "#fff7ed", c: "#c2410c" },
  { t: "Practice", bg: "#fff1f2", c: "#be123c" },
  { t: "Attendance", bg: "#ecfdf5", c: "#047857" },
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #eef4ff 0%, #ffffff 50%, #f5f3ff 100%)",
          color: "#0f172a",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              width: 72,
              height: 72,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #2457e8, #8b5cf6)",
              color: "white",
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            CA
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#475569" }}>MNNIT Allahabad · Chemical Engineering</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 96, fontWeight: 700, letterSpacing: -2 }}>The Chemical Archive</span>
          <span style={{ fontSize: 34, color: "#475569", marginTop: 12 }}>Notes, PYQs and study tools, all in one place.</span>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {CHIPS.map((c) => (
            <span key={c.t} style={{ display: "flex", padding: "12px 24px", borderRadius: 999, background: c.bg, color: c.c, fontSize: 26, fontWeight: 700 }}>
              {c.t}
            </span>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
