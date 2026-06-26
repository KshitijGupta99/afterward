import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail } from "lucide-react-native";
import { Screen, Heading, BodyText } from "@/components/layout/Screen";
import { COLORS } from "@/constants";

export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();

  return (
    <Screen>
      <SafeAreaView className="flex-1">
        <View className="py-4">
          <Text className="font-display text-lg text-slate text-center tracking-wide">
            Afterward
          </Text>
        </View>

        <View className="flex-1 justify-center items-center px-8">
          <View className="bg-surface rounded-card p-8 items-center gap-6 max-w-sm w-full shadow-card border border-lavender/50">
            <View className="w-16 h-16 rounded-full bg-lavender items-center justify-center">
              <Mail color={COLORS.ink} size={28} />
            </View>
            <View className="items-center gap-3">
              <Heading className="text-center text-2xl">Check your inbox</Heading>
              <BodyText muted className="text-center leading-5">
                We sent a secure link to{" "}
                <Text className="text-ink">{email ?? "your email"}</Text>. Tap it to
                return here.
              </BodyText>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Screen>
  );
}
