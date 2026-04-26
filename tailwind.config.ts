import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "mesh-breathe": {
          "0%, 100%": { transform: "scale(1) translate(0, 0)", opacity: "0.2" },
          "33%": { transform: "scale(1.05) translate(2%, -2%)", opacity: "0.3" },
          "66%": { transform: "scale(0.95) translate(-2%, 2%)", opacity: "0.4" },
        },
        "logo-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        }
      },
      animation: {
        "mesh-breathe": "mesh-breathe 20s ease-in-out infinite",
        "logo-pulse": "logo-pulse 4s ease-in-out infinite",
      }
    },
  },
  plugins: [],
};
export default config;
