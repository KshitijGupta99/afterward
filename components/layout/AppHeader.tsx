import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Search } from "lucide-react-native";
import { COLORS } from "@/constants";
import { cn } from "@/utils/cn";

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  avatarInitials?: string;
  onAvatarPress?: () => void;
  className?: string;
}

export function AppHeader({
  title = "Afterward",
  showBack = false,
  onBack,
  showSearch = false,
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
          <Pressable
            onPress={onBack ?? (() => router.back())}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="p-1"
          >
            <ChevronLeft color={COLORS.ink} size={24} />
          </Pressable>
        ) : null}
      </View>

      <Text className="font-display text-lg text-slate tracking-wide">{title}</Text>

      <View className="flex-row items-center gap-1 min-w-[72px] justify-end">
        {showSearch ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Search" className="p-1">
            <Search color={COLORS.ink} size={20} />
          </Pressable>
        ) : null}
        {avatarInitials ? (
          <Pressable
            onPress={onAvatarPress}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            className="w-8 h-8 rounded-full bg-lavender items-center justify-center"
          >
            <Text className="font-body-medium text-xs text-ink">{avatarInitials}</Text>
          </Pressable>
        ) : (
          <View className="w-8" />
        )}
      </View>
    </View>
  );
}
