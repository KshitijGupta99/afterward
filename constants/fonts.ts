import { Platform } from "react-native";

export const fontFamilies = {
  display: Platform.select({
    ios: "Georgia",
    android: "serif",
    default: "serif",
  }) as string,
  body: Platform.select({
    ios: "System",
    android: "sans-serif",
    default: "sans-serif",
  }) as string,
};
