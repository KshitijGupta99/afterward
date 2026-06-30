import { FadeIn, FadeInDown } from "react-native-reanimated";

export const SPRING_PRESS = { damping: 18, stiffness: 420, mass: 0.55 } as const;
export const STAGGER_MS = 65;
export const ENTER_MS = 420;

export function enterFade(index = 0) {
  return FadeIn.duration(ENTER_MS).delay(index * STAGGER_MS);
}

export function enterFadeDown(index = 0) {
  return FadeInDown.duration(ENTER_MS)
    .delay(index * STAGGER_MS)
    .springify()
    .damping(22)
    .stiffness(200);
}
