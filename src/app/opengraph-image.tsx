import { ImageResponse } from "next/og";

export const alt = "The Chemical Archive — MNNIT Allahabad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "radial-gradient(ellipse at 78% 10%, rgba(179,148,105,0.35), #0d0c0b 60%)",
          color: "#ece6da",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 18, letterSpacing: 8, color: "#b39469", fontFamily: "sans-serif" }}>
          MNNIT ALLAHABAD
        </div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 0.9 }}>
          <span style={{ fontSize: 48, fontStyle: "italic", color: "#d9d2c4" }}>The</span>
          <span style={{ fontSize: 132, letterSpacing: -4 }}>CHEMICAL</span>
          <span style={{ fontSize: 132, letterSpacing: -4 }}>ARCHIVE</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, fontStyle: "italic", color: "#b8b0a2" }}>
          <span>Your academic space. Everything in one place.</span>
          <span style={{ display: "flex", width: 120, height: 1, background: "#b39469", marginTop: 18 }} />
        </div>
      </div>
    ),
    size,
  );
}
