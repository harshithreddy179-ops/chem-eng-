import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Primary brand blue — buttons, links, active states. */
        brand: {
          50: "#eef4ff",
          100: "#dbe7ff",
          200: "#bfd3ff",
          300: "#93b4fd",
          400: "#5f8ffa",
          500: "#3a6ff5",
          600: "#2457e8",
          700: "#1c45c9",
          800: "#1d3ba2",
          900: "#1e3680",
        },
        /* Legacy token names, remapped to the light theme so every screen
           (including admin) reads correctly on white. */
        ink: {
          DEFAULT: "#ffffff",
          900: "#ffffff",
          800: "#f8fafc",
          700: "#f1f5f9",
          600: "#e2e8f0",
          500: "#cbd5e1",
        },
        ivory: {
          DEFAULT: "#0f172a",
          50: "#020617",
          100: "#1e293b",
          200: "#334155",
          300: "#475569",
          400: "#5b6b82",
          500: "#64748b",
        },
        bronze: {
          DEFAULT: "#2457e8",
          300: "#3a6ff5",
          400: "#2457e8",
          500: "#1c45c9",
          600: "#1d3ba2",
        },
        garnet: {
          DEFAULT: "#dc2626",
          300: "#ef4444",
          700: "#991b1b",
        },
        line: "#e5e9f0",
        page: "#f6f8fc",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "Times New Roman", "serif"],
        sans: ['"Inter Variable"', "Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      fontSize: {
        "display-2xl": ["clamp(2.75rem, 7vw, 5rem)", { lineHeight: "1.02", letterSpacing: "-0.01em" }],
        "display-xl": ["clamp(2.25rem, 5vw, 3.75rem)", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
        "display-lg": ["clamp(2rem, 4vw, 3rem)", { lineHeight: "1.1", letterSpacing: "-0.005em" }],
        "display-md": ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.12" }],
        "display-sm": ["clamp(1.4rem, 2.2vw, 1.875rem)", { lineHeight: "1.2" }],
        eyebrow: ["0.875rem", { lineHeight: "1.3", letterSpacing: "0.02em" }],
      },
      boxShadow: {
        card: "0 1px 2px rgb(15 23 42 / 0.04), 0 4px 14px rgb(15 23 42 / 0.05)",
        lift: "0 2px 4px rgb(15 23 42 / 0.05), 0 12px 28px rgb(15 23 42 / 0.10)",
      },
      letterSpacing: {
        luxe: "0.04em",
      },
      maxWidth: {
        frame: "80rem",
      },
      transitionTimingFunction: {
        luxe: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        900: "900ms",
        1200: "1200ms",
      },
      keyframes: {
        "page-in": { from: { opacity: "0.6" }, to: { opacity: "1" } },
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
        "page-in": "page-in 160ms ease-out",
        "slow-drift": "slow-drift 24s ease-in-out infinite",
        grain: "grain 9s steps(6) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
