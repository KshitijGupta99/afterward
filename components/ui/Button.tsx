import { Pressable, Text, ActivityIndicator, type PressableProps } from "react-native";
import { cn } from "@/utils/cn";
import { COLORS } from "@/constants";

interface ButtonProps extends PressableProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  loading?: boolean;
  className?: string;
}

export function Button({
  children,
  variant = "primary",
  loading,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      accessibilityRole="button"
      className={cn(
        "rounded-pill px-6 py-3.5 items-center justify-center min-h-[48px]",
        variant === "primary" && "bg-slate",
        variant === "secondary" && "bg-lavender",
        variant === "outline" && "border border-lavender-deep bg-surface",
        variant === "ghost" && "bg-transparent",
        isDisabled && "opacity-50",
        className
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#FFFFFF" : COLORS.ink} />
      ) : (
        <Text
          className={cn(
            "font-body-medium text-base",
            variant === "primary" && "text-white",
            variant === "secondary" && "text-ink",
            variant === "outline" && "text-ink",
            variant === "ghost" && "text-ink"
          )}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}
