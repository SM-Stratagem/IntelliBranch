import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        fraunces: ["var(--font-fraunces)", "Georgia", "serif"],
        instrument: ["var(--font-instrument)", "system-ui", "sans-serif"],
      },
      colors: {
        navy: { DEFAULT: "#0B1F3A", 2: "#132A4E" },
        teal: { DEFAULT: "#0D9488", lt: "#14B8A6" },
        offwhite: "#F8F9FC",
      },
    },
  },
  plugins: [],
};
export default config;
