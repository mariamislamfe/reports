import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dae7ff",
          200: "#bcd3ff",
          300: "#8db4ff",
          400: "#5a8bff",
          500: "#3366ff",
          600: "#234ce0",
          700: "#1c3cb3",
          800: "#1a3391",
          900: "#1a2f73",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
