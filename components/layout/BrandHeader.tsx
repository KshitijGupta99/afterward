import { View, Text } from "react-native";
import { cn } from "@/utils/cn";

export function BrandHeader({ bordered = false }: { bordered?: boolean }) {
  return (
    <View className={cn("py-4 bg-surface", bordered && "border-b border-lavender")}>
      <Text className="font-display text-lg text-slate text-center tracking-wide">
        Afterward
      </Text>
    </View>
  );
}
