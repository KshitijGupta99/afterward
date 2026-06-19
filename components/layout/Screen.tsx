import { Text, View, type TextProps, type ViewProps } from "react-native";
import { cn } from "@/utils/cn";

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export function Screen({ children, className, ...props }: ScreenProps) {
  return (
    <View className={cn("flex-1 bg-paper", className)} {...props}>
      {children}
    </View>
  );
}

interface HeadingProps extends TextProps {
  children: React.ReactNode;
  className?: string;
}

export function Heading({ children, className, ...props }: HeadingProps) {
  return (
    <Text
      className={cn(
        "font-display text-ink text-2xl tracking-wide",
        className
      )}
      accessibilityRole="header"
      {...props}
    >
      {children}
    </Text>
  );
}

interface BodyTextProps extends TextProps {
  children: React.ReactNode;
  className?: string;
  muted?: boolean;
}

export function BodyText({ children, className, muted, ...props }: BodyTextProps) {
  return (
    <Text
      className={cn(
        "font-body text-base leading-6",
        muted ? "text-ink/60" : "text-ink",
        className
      )}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Divider({ className }: { className?: string }) {
  return <View className={cn("h-px bg-mist", className)} />;
}
