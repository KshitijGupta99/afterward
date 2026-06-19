export const COLORS = {
  paper: "#FAF7F2",
  ink: "#2B2A28",
  dusk: "#3D4F5C",
  mist: "#E8E3DA",
  amber: "#C98A4B",
  moss: "#6B7A5E",
} as const;

export { fontFamilies } from "./fonts";

export const STORAGE_BUCKET = "capsule-photos";

export const DRAFT_STORAGE_KEY = "capsule_draft";

export const DATE_PRESETS = {
  oneYear: { label: "In 1 year", years: 1 },
  fiveYears: { label: "In 5 years", years: 5 },
  tenYears: { label: "In 10 years", years: 10 },
} as const;

export const NOTIFICATION_COPY = {
  title: "Something has been waiting for you.",
  body: "A message written in the past is ready to be opened.",
} as const;

export const APP_SCHEME = "afterward";
