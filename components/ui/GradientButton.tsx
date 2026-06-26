import { Pressable, Text, ActivityIndicator, type PressableProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "@/constants";
import { cn } from "@/utils/cn";

interface GradientButtonProps extends PressableProps {
  children: string;
  loading?: boolean;
  variant?: "primary" | "login";
  className?: string;
}

export function GradientButton({
  children,
  loading,
  disabled,
  variant = "primary",
  className,
  ...props
}: GradientButtonProps) {
  const isDisabled = disabled || loading;
  const colors =
    variant === "login"
      ? ([COLORS.accent, COLORS.gradientMint] as const)
      : ([COLORS.gradientStart, COLORS.gradientEnd] as const);

  return (
    <Pressable
      disabled={isDisabled}
      accessibilityRole="button"
      className={cn("rounded-pill overflow-hidden", isDisabled && "opacity-50", className)}
      {...props}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        className="px-8 py-4 items-center justify-center min-h-[52px]"
      >
        {loading ? (
          <ActivityIndicator color={variant === "login" ? COLORS.ink : "#FFFFFF"} />
        ) : (
          <Text
            className={cn(
              "font-body-medium text-base",
              variant === "login" ? "text-ink" : "text-white font-display"
            )}
          >
            {children}
          </Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}
