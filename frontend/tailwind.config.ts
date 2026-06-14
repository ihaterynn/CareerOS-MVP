import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14223D",
        muted: "#5A6478",
        faint: "#8C93A3",
        mist: "#F8F5EE",
        paper: "#FFFEFB",
        cream: "#FDFBF7",
        line: "#EAE3D5",
        rule: "#DED5C3",
        gold: "#A9802F",
        teal: "#A9802F",
        coral: "#5B5BD6",
        good: "#3F8F5E",
        warn: "#BC8A2E",
        bad: "#C0544D",
        info: "#3E6EA8"
      },
      boxShadow: {
        soft: "0 2px 6px rgba(40,32,12,.05), 0 8px 24px rgba(40,32,12,.06)",
        lifted: "0 8px 18px rgba(40,32,12,.08), 0 24px 60px rgba(40,32,12,.12)"
      }
    }
  },
  plugins: []
};

export default config;
