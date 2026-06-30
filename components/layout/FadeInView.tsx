import Animated from "react-native-reanimated";
import { type ViewStyle } from "react-native";
import { enterFade, enterFadeDown } from "@/constants/animations";
import { cn } from "@/utils/cn";

interface FadeInViewProps {
  children: React.ReactNode;
  index?: number;
  variant?: "fade" | "down";
  className?: string;
  style?: ViewStyle;
}

export function FadeInView({
  children,
  index = 0,
  variant = "down",
  className,
  style,
}: FadeInViewProps) {
  const entering = variant === "fade" ? enterFade(index) : enterFadeDown(index);

  return (
    <Animated.View entering={entering} className={cn(className)} style={style}>
      {children}
    </Animated.View>
  );
}
