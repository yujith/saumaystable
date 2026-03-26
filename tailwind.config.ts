import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // ── Saffron Hearth design system ────────────────────────────────
        "primary": "#9a4601",
        "on-primary": "#ffffff",
        "primary-container": "#e07b39",
        "on-primary-container": "#4f2100",
        "primary-fixed": "#ffdbc9",
        "primary-fixed-dim": "#ffb68c",
        "on-primary-fixed": "#321200",
        "on-primary-fixed-variant": "#763400",
        "inverse-primary": "#ffb68c",

        "secondary": "#625e56",
        "on-secondary": "#ffffff",
        "secondary-container": "#e8e2d8",
        "on-secondary-container": "#68645c",
        "secondary-fixed": "#e8e2d8",
        "secondary-fixed-dim": "#ccc6bc",
        "on-secondary-fixed": "#1e1b16",
        "on-secondary-fixed-variant": "#4a463f",

        "tertiary": "#2c694e",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#65a284",
        "on-tertiary-container": "#003623",
        "tertiary-fixed": "#b1f0ce",
        "tertiary-fixed-dim": "#95d4b3",
        "on-tertiary-fixed": "#002114",
        "on-tertiary-fixed-variant": "#0e5138",

        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",

        "surface": "#fcf9f8",
        "surface-dim": "#dcd9d9",
        "surface-bright": "#fcf9f8",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f6f3f2",
        "surface-container": "#f0eded",
        "surface-container-high": "#eae7e7",
        "surface-container-highest": "#e5e2e1",
        "surface-variant": "#e5e2e1",
        "surface-tint": "#9a4601",

        "on-surface": "#1c1b1b",
        "on-surface-variant": "#554339",
        "inverse-surface": "#313030",
        "inverse-on-surface": "#f3f0ef",

        "outline": "#897367",
        "outline-variant": "#dcc1b4",

        "background": "#fcf9f8",
        "on-background": "#1c1b1b",

        // ── shadcn/ui compatibility (admin panel) ──────────────────────
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        headline: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        body: ["var(--font-noto)", "Noto Serif", "serif"],
        label: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        serif: ["var(--font-noto)", "Noto Serif", "serif"],
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
        // shadcn-compat
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        breathing: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        breathing: "breathing 3s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out",
      },
      boxShadow: {
        sun: "0 40px 60px -20px rgba(28,27,27,0.08)",
        editorial: "0 40px 60px -20px rgba(28,27,27,0.06)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
