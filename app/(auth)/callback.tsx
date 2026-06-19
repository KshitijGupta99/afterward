import { useEffect } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { SafeAreaView } from "react-native-safe-area-context";
import { Screen, Heading, BodyText } from "@/components/layout/Screen";
import { WaxSeal } from "@/components/capsule/WaxSeal";
import { Button } from "@/components/ui/Button";
import { createSessionFromUrl } from "@/utils/auth";

export default function AuthCallbackScreen() {
  const { error: paramError } = useLocalSearchParams<{ error?: string }>();
  const router = useRouter();

  useEffect(() => {
    if (paramError) return;

    Linking.getInitialURL().then(async (url) => {
      if (!url) return;
      const result = await createSessionFromUrl(url);
      if (result.ok) {
        router.replace("/(tabs)/vault");
      }
    });
  }, [paramError, router]);

  if (paramError) {
    return (
      <Screen>
        <SafeAreaView className="flex-1 justify-center items-center px-8">
          <View className="items-center gap-6 max-w-sm">
            <Heading className="text-center text-xl">Could not sign in</Heading>
            <BodyText muted className="text-center">
              {paramError}
            </BodyText>
            <Button onPress={() => router.replace("/(auth)/login")}>
              Try again
            </Button>
          </View>
        </SafeAreaView>
      </Screen>
    );
  }

  return (
    <Screen>
      <SafeAreaView className="flex-1 justify-center items-center px-8">
        <View className="items-center gap-6">
          <WaxSeal size={72} state="locked" />
          <BodyText muted className="text-center">Signing you in...</BodyText>
        </View>
      </SafeAreaView>
    </Screen>
  );
}
