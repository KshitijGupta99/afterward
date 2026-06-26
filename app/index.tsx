import { useRef } from "react";
import { View, ScrollView, Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Clock, Shield, Calendar, Sparkles } from "lucide-react-native";
import { Screen, Heading, BodyText } from "@/components/layout/Screen";
import { GradientButton } from "@/components/ui/GradientButton";
import { useAuth } from "@/hooks/useAuth";
import { COLORS } from "@/constants";

const FEATURES = [
  {
    icon: Shield,
    title: "Secure",
    body: "Your words are encrypted and kept safe until the moment they are meant to be seen.",
  },
  {
    icon: Calendar,
    title: "Timeless",
    body: "From weeks to decades, set your own horizon for delivery.",
  },
  {
    icon: Sparkles,
    title: "Simple",
    body: "No noise. No social feeds. Just a quiet space for your legacy.",
  },
] as const;

export default function LandingScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const scrollRef = useRef<ScrollView>(null);

  const handleStart = () => {
    if (isAuthenticated) {
      router.push("/(tabs)/new");
    } else {
      router.push("/(auth)/login");
    }
  };

  return (
    <Screen>
      <SafeAreaView className="flex-1">
        <View className="py-4 border-b border-lavender bg-surface">
          <Text className="font-display text-lg text-slate text-center tracking-wide">
            Afterward
          </Text>
        </View>

        <ScrollView ref={scrollRef} className="flex-1" showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={["#F3F4FF", COLORS.paper]}
            className="px-8 pt-10 pb-8 items-center"
          >
            <View className="w-16 h-16 rounded-full bg-lavender items-center justify-center mb-6">
              <Clock color={COLORS.ink} size={28} />
            </View>

            <Heading className="text-center text-3xl leading-tight mb-4">
              A message for later.
            </Heading>
            <BodyText muted className="text-center text-base leading-6 mb-8 px-2">
              Write a thought today. Pick a date in the future.{"\n"}We'll deliver it then.
            </BodyText>

            <GradientButton onPress={handleStart} className="w-full">
              Start your capsule
            </GradientButton>

            <Pressable
              onPress={() => scrollRef.current?.scrollTo({ y: 420, animated: true })}
              className="mt-5 py-2"
              accessibilityRole="button"
            >
              <Text className="font-body text-sm text-ink">How it works</Text>
            </Pressable>
          </LinearGradient>

          <View className="px-6 pb-12 gap-4">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <View
                key={title}
                className="bg-surface rounded-card p-5 border border-lavender/60 shadow-soft"
              >
                <Icon color={COLORS.muted} size={22} strokeWidth={1.5} />
                <Text className="font-display text-lg text-slate mt-3 mb-2">{title}</Text>
                <Text className="font-body text-sm text-muted leading-5">{body}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
