import { Tabs } from "expo-router";
import { TabBar } from "@/components/layout/TabBar";
import { COLORS } from "@/constants";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: COLORS.paper },
      }}
    >
      <Tabs.Screen name="vault" options={{ title: "Vault" }} />
      <Tabs.Screen name="new" options={{ title: "New Capsule" }} />
      <Tabs.Screen name="settings" options={{ href: null, title: "Settings" }} />
    </Tabs>
  );
}
