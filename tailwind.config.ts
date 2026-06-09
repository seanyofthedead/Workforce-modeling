import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // DHS-inspired institutional palette
        navy: {
          50: "#eef2f7",
          100: "#dde6ee",
          200: "#b9cbdd",
          300: "#8aa9c6",
          400: "#5a83a8",
          500: "#3a6490",
          600: "#2c4e74",
          700: "#1f3a59",
          800: "#16293f",
          900: "#0e1b2c",
          950: "#081320",
        },
        agency: {
          DEFAULT: "#1f3a59",
          accent: "#b8842c",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(14, 27, 44, 0.06), 0 1px 3px 0 rgba(14, 27, 44, 0.08)",
        panel: "0 4px 16px -2px rgba(14, 27, 44, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
