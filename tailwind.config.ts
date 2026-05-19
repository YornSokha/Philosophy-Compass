import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      colors: {
        bg: "#060c1a",
        surface: "#0f1729",
        "surface-2": "#1a2440",
        border: "#2a3a5c",
        text: "#cdd8ee",
        muted: "#7889aa",
        faint: "#3f4f6c",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-in": "slideIn 0.4s ease-out forwards",
        "blend-fill": "blendFill 0.8s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        blendFill: {
          "0%": { width: "0%" },
          "100%": { width: "var(--blend-width)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
