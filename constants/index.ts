export const COLORS = {
  paper: "#F7F8FC",
  surface: "#FFFFFF",
  ink: "#4A4E69",
  slate: "#3D3D5C",
  muted: "#757575",
  lavender: "#E8ECFB",
  lavenderDeep: "#D8DCF0",
  accent: "#B5B9D7",
  gradientStart: "#5D5D81",
  gradientEnd: "#9A9ABF",
  gradientMint: "#C8DDD6",
  success: "#E8F5E9",
  successText: "#5A8F6F",
  warning: "#D4A574",
  border: "#E8ECFB",
  // legacy aliases
  dusk: "#5D5D81",
  mist: "#E8ECFB",
  amber: "#D4A574",
  moss: "#5A8F6F",
} as const;

/** Use inline instead of NativeWind shadow-* when toggling classes (avoids nav context crash in dev). */
export const SHADOW_STYLES = {
  soft: {
    shadowColor: "rgba(74, 78, 105, 0.08)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  card: {
    shadowColor: "rgba(74, 78, 105, 0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 4,
  },
} as const;

export const STORAGE_BUCKET = "capsule-photos";

export const DRAFT_STORAGE_KEY = "capsule_draft";

export const DATE_PRESETS = {
  oneYear: { label: "1 Year", years: 1 },
  fiveYears: { label: "5 Years", years: 5 },
  tenYears: { label: "10 Years", years: 10 },
} as const;

export const NOTIFICATION_COPY = {
  title: "Something has been waiting for you.",
  body: "A message written in the past is ready to be opened.",
} as const;

export const APP_SCHEME = "afterward";
