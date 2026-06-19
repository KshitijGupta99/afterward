import { View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Screen, Heading, BodyText } from "@/components/layout/Screen";
import { WaxSeal } from "@/components/capsule/WaxSeal";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function LandingScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleStart = () => {
    if (isAuthenticated) {
      router.push("/(tabs)/new");
    } else {
      router.push("/(auth)/login");
    }
  };

  return (
    <Screen>
      <SafeAreaView className="flex-1 justify-center items-center px-8">
        <View className="items-center gap-10 max-w-sm">
          <WaxSeal size={100} state="locked" breathing />
          <View className="items-center gap-4">
            <Heading className="text-center text-3xl leading-tight">
              Some things deserve to arrive later.
            </Heading>
            <BodyText muted className="text-center text-lg leading-7">
              Write something today.{"\n"}Read it when it matters.
            </BodyText>
          </View>
          <Button onPress={handleStart} className="w-full mt-4">
            Write your first capsule
          </Button>
        </View>
      </SafeAreaView>
    </Screen>
  );
}
