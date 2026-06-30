import { Text, ActivityIndicator, type PressableProps, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SHADOW_STYLES } from "@/constants";
import { cn } from "@/utils/cn";
import { ScalePressable } from "@/components/ui/ScalePressable";

interface GradientButtonProps extends PressableProps {
  children: string;
  loading?: boolean;
  variant?: "primary" | "login";
  className?: string;
  shadow?: boolean;
}

export function GradientButton({
  children,
  loading,
  disabled,
  variant = "primary",
  className,
  shadow = true,
  style,
  ...props
}: GradientButtonProps) {
  const isDisabled = disabled || loading;
  const colors =
    variant === "login"
      ? ([COLORS.accent, COLORS.gradientMint] as const)
      : ([COLORS.gradientStart, COLORS.gradientEnd] as const);

  return (
    <ScalePressable
      disabled={isDisabled}
      accessibilityRole="button"
      className={cn(isDisabled && "opacity-50", className)}
      style={[
        { width: "100%", borderRadius: 9999, overflow: "hidden" },
        shadow && variant === "primary" ? SHADOW_STYLES.card : undefined,
        style as ViewStyle,
      ]}
      {...props}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          width: "100%",
          minHeight: 52,
          paddingHorizontal: 32,
          paddingVertical: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color={variant === "login" ? COLORS.ink : "#FFFFFF"} />
        ) : (
          <Text
            className={cn(
              variant === "login"
                ? "font-body-medium text-base text-ink"
                : "font-display text-base text-white"
            )}
            style={{ textAlign: "center", includeFontPadding: false, lineHeight: 22 }}
          >
            {children}
          </Text>
        )}
      </LinearGradient>
    </ScalePressable>
  );
}
