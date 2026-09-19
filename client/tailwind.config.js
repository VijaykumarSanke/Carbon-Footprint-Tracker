/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        eco: {
          50: "#dfffe9",
          100: "#b9ffcf",
          300: "#4ade80",
          400: "#22c55e",
          500: "#16a34a",
          800: "#14532d",
          900: "#0a1f12",
        },
      },
      boxShadow: {
        glow: "0 0 30px rgba(34, 197, 94, 0.18)",
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, rgba(74, 222, 128, 0.15) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
