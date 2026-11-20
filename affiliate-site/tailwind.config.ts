import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7f3",
          100: "#d5ece2",
          200: "#acd9c6",
          500: "#1f8a63",
          600: "#17724f",
          700: "#125c40",
          900: "#0b3626",
        },
        ink: { DEFAULT: "#16202b", soft: "#475467", mute: "#667085" },
        line: "#e4e7ec",
        paper: "#fbfaf7",
        cta: { DEFAULT: "#e8590c", hover: "#cc4b07" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      maxWidth: { prose: "72ch" },
    },
  },
  plugins: [typography],
} satisfies Config;
