import React from "react";
import { useEffect } from "react";
import { Pressable, Text, View, AccessibilityInfo } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { COLORS, fontFamilies } from "@/constants";

type SealState = "locked" | "delivered" | "closing" | "overdue";

interface WaxSealProps {
  state?: SealState;
  size?: number;
  label?: string;
  onPress?: () => void;
  disabled?: boolean;
  breathing?: boolean;
  accessibilityLabel?: string;
}

export function WaxSeal({
  state = "locked",
  size = 80,
  label,
  onPress,
  disabled = false,
  breathing = state === "locked",
  accessibilityLabel,
}: WaxSealProps) {
  const breath = useSharedValue(0);
  const closeAnim = useSharedValue(state === "closing" ? 1 : 0);
  const [reduceMotion, setReduceMotion] = React.useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (breathing && !reduceMotion && state === "locked") {
      breath.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else if (!reduceMotion && state === "overdue") {
      breath.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      breath.value = 0;
    }
  }, [breathing, reduceMotion, state, breath]);

  useEffect(() => {
    if (state === "closing") {
      closeAnim.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    }
  }, [state, closeAnim]);

  const animatedStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(breath.value, [0, 1], [0.2, 0.35]);
    const scale = interpolate(breath.value, [0, 1], [1, 1.02]);
    const closeScale = interpolate(closeAnim.value, [0, 1], [1, 0.95]);

    const isOpen = state === "delivered";
    const isOverdue = state === "overdue";
    const glowColor = isOpen || isOverdue ? COLORS.amber : COLORS.dusk;

    return {
      transform: [{ scale: scale * closeScale }],
      shadowColor: glowColor,
      shadowOpacity: isOpen || isOverdue ? 0.35 : shadowOpacity,
      shadowRadius: isOpen || isOverdue ? 16 : interpolate(breath.value, [0, 1], [8, 14]),
      shadowOffset: { width: 0, height: isOpen ? 2 : 4 },
      elevation: isOpen ? 6 : 4,
    };
  });

  const innerStyle = useAnimatedStyle(() => {
    const isOpen = state === "delivered";
    const isOverdue = state === "overdue";
    return {
      opacity: isOpen || isOverdue ? 0.9 : 1,
      transform: [{ scale: isOpen ? 0.92 : 1 }],
    };
  });

  const isOpen = state === "delivered";
  const isOverdue = state === "overdue";

  const content = (
    <Animated.View style={[{ alignItems: "center" }, animatedStyle]}>
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isOpen
              ? COLORS.amber
              : isOverdue
                ? "rgba(201, 138, 75, 0.92)"
                : COLORS.dusk,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: isOpen || isOverdue ? 1 : 2,
            borderColor: isOverdue
              ? "rgba(201,138,75,0.55)"
              : isOpen
                ? "rgba(201,138,75,0.4)"
                : "rgba(255,255,255,0.15)",
          },
          innerStyle,
        ]}
      >
        <View
          style={{
            width: size * 0.55,
            height: size * 0.55,
            borderRadius: (size * 0.55) / 2,
            borderWidth: 1.5,
            borderColor: isOverdue
              ? "rgba(201,138,75,0.5)"
              : isOpen
                ? "rgba(201,138,75,0.5)"
                : "rgba(255,255,255,0.2)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isOpen ? (
            <View
              style={{
                width: size * 0.25,
                height: 2,
                backgroundColor: "rgba(255,255,255,0.4)",
                transform: [{ rotate: "-30deg" }],
              }}
            />
          ) : (
            <Text
              style={{
                fontFamily: fontFamilies.display,
                fontSize: size * 0.22,
                color: "rgba(255,255,255,0.7)",
                letterSpacing: 2,
              }}
            >
              A
            </Text>
          )}
        </View>
      </Animated.View>
      {label ? (
        <Text
          className={`font-body text-sm mt-3 text-center ${
            isOverdue ? "text-amber" : "text-ink"
          }`}
          style={{ maxWidth: size * 2 }}
        >
          {label}
        </Text>
      ) : null}
    </Animated.View>
  );

  if (onPress && !disabled) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label ?? "Wax seal"}
        className="active:opacity-80"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
