import { Pressable, Text, ActivityIndicator, type PressableProps } from "react-native";
import { cn } from "@/utils/cn";

interface ButtonProps extends PressableProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
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
        "rounded-soft px-6 py-3.5 items-center justify-center min-h-[48px]",
        variant === "primary" && "bg-dusk",
        variant === "secondary" && "bg-mist",
        variant === "ghost" && "bg-transparent",
        isDisabled && "opacity-50",
        className
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#FAF7F2" : "#3D4F5C"} />
      ) : (
        <Text
          className={cn(
            "font-body text-base",
            variant === "primary" && "text-paper",
            variant === "secondary" && "text-ink",
            variant === "ghost" && "text-dusk"
          )}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}
