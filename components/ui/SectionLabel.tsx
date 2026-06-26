import { Text } from "react-native";
import { cn } from "@/utils/cn";

export function SectionLabel({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <Text
      className={cn(
        "font-body-medium text-xs text-ink uppercase tracking-widest",
        className
      )}
    >
      {children}
    </Text>
  );
}
