import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Screen } from "@/components/layout/Screen";

export function ConfigErrorScreen() {
  return (
    <Screen>
      <SafeAreaView className="flex-1 justify-center px-8">
        <View className="bg-surface rounded-card p-6 border border-lavender">
          <Text className="font-display text-xl text-slate mb-3 text-center">
            App not configured
          </Text>
          <Text className="font-body text-sm text-muted leading-5 text-center">
            This build is missing Supabase credentials. Add{" "}
            <Text className="text-ink">EXPO_PUBLIC_SUPABASE_URL</Text> and{" "}
            <Text className="text-ink">EXPO_PUBLIC_SUPABASE_ANON_KEY</Text> in the
            EAS project environment, then create a new build.
          </Text>
        </View>
      </SafeAreaView>
    </Screen>
  );
}
