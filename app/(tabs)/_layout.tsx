import { Tabs } from "expo-router";
import { Archive, PenLine, Settings } from "lucide-react-native";
import { COLORS } from "@/constants";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.paper,
          borderTopColor: COLORS.mist,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.dusk,
        tabBarInactiveTintColor: "rgba(43, 42, 40, 0.4)",
        tabBarLabelStyle: {
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="vault"
        options={{
          title: "Vault",
          tabBarIcon: ({ color, size }) => <Archive color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="new"
        options={{
          title: "New",
          tabBarIcon: ({ color, size }) => <PenLine color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
