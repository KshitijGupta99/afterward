import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Archive, PlusCircle } from "lucide-react-native";
import { COLORS } from "@/constants";
import { cn } from "@/utils/cn";

const VISIBLE_TABS = ["vault", "new"] as const;

type TabRoute = BottomTabBarProps["state"]["routes"][number];

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row bg-surface border-t border-lavender px-8 pt-2"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      {state.routes
        .filter((route: TabRoute) =>
          VISIBLE_TABS.includes(route.name as (typeof VISIBLE_TABS)[number])
        )
        .map((route: TabRoute) => {
          const index = state.routes.findIndex((r: TabRoute) => r.key === route.key);
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];
          const label =
            route.name === "vault"
              ? "Vault"
              : route.name === "new"
                ? "New Capsule"
                : options.title;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={label}
              className="flex-1 items-center py-2"
            >
              <View
                className={cn(
                  "items-center justify-center px-5 py-2 rounded-pill",
                  isFocused && "bg-lavender"
                )}
              >
                {route.name === "vault" ? (
                  <Archive color={isFocused ? COLORS.ink : COLORS.muted} size={22} />
                ) : (
                  <PlusCircle color={isFocused ? COLORS.ink : COLORS.muted} size={22} />
                )}
                <Text
                  className={cn(
                    "font-body text-xs mt-1",
                    isFocused ? "text-ink" : "text-muted"
                  )}
                >
                  {label}
                </Text>
              </View>
            </Pressable>
          );
        })}
    </View>
  );
}
