import type { Config } from "tailwindcss";

/**
 * Design tokens repris de la charte simulateurs.sinvestir.fr (frame "Charte").
 * Thème sombre, premium, pédagogique.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces (du plus profond au plus clair)
        surface: {
          deep: "#03081A",
          base: "#060B1C",
          card: "#0E1426",
          input: "#0A1020",
          raised: "#162038",
        },
        // Marque & accents (calés sur le live simulateurs.sinvestir.fr)
        brand: {
          DEFAULT: "#2575E8",
          light: "#3B8EF2",
          graph: "#3B9AF0",
          gold: "#F2C230",
          sky: "#4FA8EC",
        },
        // Textes
        ink: {
          DEFAULT: "#F4F7FF",
          soft: "#9AA6C2",
          muted: "#7E8AA8",
          faint: "#6B7794",
          dim: "#5E6A87",
          cool: "#C7D0E6",
          blue: "#9DC0FF",
        },
        success: "#2ECC71",
        danger: "#DD5033",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 20px 50px rgba(0,0,0,.35)",
        panel: "0 24px 60px rgba(0,0,0,.45)",
        glow: "0 10px 26px rgba(22,104,227,.45)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up .4s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
