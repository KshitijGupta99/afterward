import { useRef } from "react";
import { View, ScrollView, Text } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Clock, Shield, Calendar, Sparkles } from "lucide-react-native";
import { Screen, Heading, BodyText } from "@/components/layout/Screen";
import { BrandHeader } from "@/components/layout/BrandHeader";
import { FadeInView } from "@/components/layout/FadeInView";
import { GradientButton } from "@/components/ui/GradientButton";
import { ScalePressable } from "@/components/ui/ScalePressable";
import { useAuth } from "@/hooks/useAuth";
import { COLORS, SHADOW_STYLES } from "@/constants";

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
        <BrandHeader bordered />

        <ScrollView ref={scrollRef} className="flex-1" showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={["#F3F4FF", COLORS.paper]}
            style={{ paddingHorizontal: 32, paddingTop: 40, paddingBottom: 32, alignItems: "center" }}
          >
            <FadeInView index={0}>
              <View className="w-16 h-16 rounded-full bg-lavender items-center justify-center mb-6">
                <Clock color={COLORS.ink} size={28} />
              </View>
            </FadeInView>

            <FadeInView index={1}>
              <Heading className="text-center text-3xl leading-tight mb-4">
                A message for later.
              </Heading>
            </FadeInView>

            <FadeInView index={2}>
              <BodyText muted className="text-center text-base leading-6 mb-8 px-2">
                Write a thought today. Pick a date in the future.{"\n"}We'll deliver it then.
              </BodyText>
            </FadeInView>

            <FadeInView index={3} style={{ width: "100%", maxWidth: 360 }}>
              <GradientButton onPress={handleStart}>Start your capsule</GradientButton>
            </FadeInView>

            <FadeInView index={4}>
              <ScalePressable
                onPress={() => scrollRef.current?.scrollTo({ y: 420, animated: true })}
                className="mt-5 py-2"
                accessibilityRole="button"
              >
                <Text className="font-body text-sm text-ink text-center">How it works</Text>
              </ScalePressable>
            </FadeInView>
          </LinearGradient>

          <View className="px-6 pb-12 gap-4">
            {FEATURES.map(({ icon: Icon, title, body }, i) => (
              <FadeInView key={title} index={5 + i}>
                <View
                  className="bg-surface rounded-card p-5 border border-lavender/60"
                  style={SHADOW_STYLES.soft}
                >
                  <Icon color={COLORS.muted} size={22} strokeWidth={1.5} />
                  <Text className="font-display text-lg text-slate mt-3 mb-2">{title}</Text>
                  <Text className="font-body text-sm text-muted leading-5">{body}</Text>
                </View>
              </FadeInView>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
