/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        paper: "#FAF7F2",
        ink: "#2B2A28",
        dusk: "#3D4F5C",
        mist: "#E8E3DA",
        amber: "#C98A4B",
        moss: "#6B7A5E",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["System", "sans-serif"],
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
      },
      borderRadius: {
        soft: "12px",
        card: "16px",
        seal: "9999px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(43, 42, 40, 0.06)",
        card: "0 4px 16px rgba(43, 42, 40, 0.08)",
        seal: "0 4px 12px rgba(61, 79, 92, 0.25), inset 0 1px 2px rgba(255,255,255,0.3)",
        "seal-open": "0 2px 8px rgba(201, 138, 75, 0.2), inset 0 1px 1px rgba(255,255,255,0.2)",
      },
    },
  },
  plugins: [],
};
