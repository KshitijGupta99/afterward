import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { SafeAreaView } from "react-native-safe-area-context";
import { Screen, Heading, BodyText } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { createSessionFromUrl } from "@/utils/auth";
import { COLORS } from "@/constants";

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
          <View className="bg-surface rounded-card p-8 items-center gap-6 max-w-sm w-full border border-lavender/50 shadow-soft">
            <Heading className="text-center text-xl">Could not sign in</Heading>
            <BodyText muted className="text-center leading-5">
              {paramError}
            </BodyText>
            <Button onPress={() => router.replace("/(auth)/login")} className="w-full">
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
        <View className="items-center gap-4">
          <ActivityIndicator color={COLORS.slate} size="large" />
          <BodyText muted className="text-center">Signing you in...</BodyText>
        </View>
      </SafeAreaView>
    </Screen>
  );
}
