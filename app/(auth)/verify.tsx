import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Screen, Heading, BodyText } from "@/components/layout/Screen";
import { WaxSeal } from "@/components/capsule/WaxSeal";

export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();

  return (
    <Screen>
      <SafeAreaView className="flex-1 justify-center items-center px-8">
        <View className="items-center gap-8 max-w-sm">
          <WaxSeal size={72} state="locked" />
          <View className="items-center gap-3">
            <Heading className="text-center">Check your inbox</Heading>
            <BodyText muted className="text-center">
              We sent a link to {email ?? "your email"}. Tap it to return here.
            </BodyText>
          </View>
        </View>
      </SafeAreaView>
    </Screen>
  );
}
