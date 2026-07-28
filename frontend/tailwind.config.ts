import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  darkMode: "class",
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", ...defaultTheme.fontFamily.sans],
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        mono: ["IBM Plex Mono", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        at: {
          "bg-dark": "#14171F",
          "bg-dark-elevated": "#1E212D",
          "bg-dark-input": "#26293D",
          "bg-light": "#E6DAD2",
          "bg-light-elevated": "#EFE9E3",
          "bg-light-input": "#FFFFFF",
          "accent-primary": "#C0192B",
          "accent-primary-hover": "#A81525",
          "accent-secondary": "#35408C",
          "accent-secondary-hover": "#2A3370",
          rating: "var(--rating)",
          "text-primary-dark": "#F1F0EC",
          "text-secondary-dark": "#B8B7B0",
          "text-tertiary-dark": "#7F7D74",
          "text-primary-light": "#1A1B1E",
          "text-secondary-light": "#6B6D76",
          "text-tertiary-light": "#A3A5AE",
          "border-dark": "#3C3F4D",
          "border-light": "#C9CAD1",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
