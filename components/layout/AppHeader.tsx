import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { COLORS } from "@/constants";
import { cn } from "@/utils/cn";
import { ScalePressable } from "@/components/ui/ScalePressable";

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  avatarInitials?: string;
  onAvatarPress?: () => void;
  className?: string;
}

export function AppHeader({
  title = "Afterward",
  showBack = false,
  onBack,
  avatarInitials,
  onAvatarPress,
  className,
}: AppHeaderProps) {
  const router = useRouter();

  return (
    <View
      className={cn(
        "flex-row items-center justify-between px-5 py-3 bg-surface border-b border-lavender",
        className
      )}
    >
      <View className="w-10">
        {showBack ? (
          <ScalePressable
            onPress={onBack ?? (() => router.back())}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="p-1"
          >
            <ChevronLeft color={COLORS.ink} size={24} />
          </ScalePressable>
        ) : null}
      </View>

      <Text className="font-display text-lg text-slate tracking-wide">{title}</Text>

      <View className="w-10 items-end">
        {avatarInitials ? (
          <ScalePressable
            onPress={onAvatarPress}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            className="w-8 h-8 rounded-full bg-lavender items-center justify-center"
          >
            <Text className="font-body-medium text-xs text-ink">{avatarInitials}</Text>
          </ScalePressable>
        ) : (
          <View className="w-8" />
        )}
      </View>
    </View>
  );
}
