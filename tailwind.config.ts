import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0d0c0b",
          900: "#0d0c0b",
          800: "#131210",
          700: "#1a1916",
          600: "#23211d",
          500: "#2e2b26",
        },
        ivory: {
          DEFAULT: "#ece6da",
          50: "#f6f2ea",
          100: "#ece6da",
          200: "#d9d2c4",
          300: "#b8b0a2",
          400: "#8f887c",
          500: "#6b655b",
        },
        bronze: {
          DEFAULT: "#b39469",
          300: "#cdb48e",
          400: "#b39469",
          500: "#957752",
          600: "#76603f",
        },
        line: "rgb(236 230 218 / 0.12)",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "Times New Roman", "serif"],
        sans: ['"Inter Variable"', "Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      fontSize: {
        "display-2xl": ["clamp(4.5rem, 17vw, 17rem)", { lineHeight: "0.82", letterSpacing: "-0.035em" }],
        "display-xl": ["clamp(3.25rem, 9vw, 9rem)", { lineHeight: "0.9", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2.1rem, 6vw, 6rem)", { lineHeight: "0.95", letterSpacing: "-0.025em" }],
        "display-md": ["clamp(2rem, 4vw, 3.75rem)", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "display-sm": ["clamp(1.6rem, 2.6vw, 2.4rem)", { lineHeight: "1.08", letterSpacing: "-0.015em" }],
        eyebrow: ["0.6875rem", { lineHeight: "1.2", letterSpacing: "0.28em" }],
      },
      letterSpacing: {
        luxe: "0.32em",
      },
      maxWidth: {
        frame: "92rem",
      },
      transitionTimingFunction: {
        luxe: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        900: "900ms",
        1200: "1200ms",
      },
      keyframes: {
        "slow-drift": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(0,-1.5%,0) scale(1.03)" },
        },
        grain: {
          "0%, 100%": { transform: "translate(0,0)" },
          "20%": { transform: "translate(-3%,2%)" },
          "40%": { transform: "translate(2%,-3%)" },
          "60%": { transform: "translate(-2%,-1%)" },
          "80%": { transform: "translate(3%,3%)" },
        },
      },
      animation: {
        "slow-drift": "slow-drift 24s ease-in-out infinite",
        grain: "grain 9s steps(6) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
