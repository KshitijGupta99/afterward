/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        paper: "#F7F8FC",
        surface: "#FFFFFF",
        ink: "#4A4E69",
        slate: "#3D3D5C",
        muted: "#757575",
        lavender: "#E8ECFB",
        "lavender-deep": "#D8DCF0",
        accent: "#B5B9D7",
        success: "#E8F5E9",
        "success-text": "#5A8F6F",
        warning: "#D4A574",
        dusk: "#5D5D81",
        mist: "#E8ECFB",
        amber: "#D4A574",
        moss: "#5A8F6F",
      },
      fontFamily: {
        display: ["PlayfairDisplay_600SemiBold"],
        "display-bold": ["PlayfairDisplay_700Bold"],
        body: ["DMSans_400Regular"],
        "body-medium": ["DMSans_500Medium"],
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
        card: "20px",
        pill: "9999px",
        seal: "9999px",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(74, 78, 105, 0.08)",
        card: "0 4px 20px rgba(74, 78, 105, 0.1)",
      },
    },
  },
  plugins: [],
};
