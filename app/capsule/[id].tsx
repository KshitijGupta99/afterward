import { View, ScrollView, Image, Share, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { X, Share2 } from "lucide-react-native";
import { Screen, BodyText } from "@/components/layout/Screen";
import { WaxSeal } from "@/components/capsule/WaxSeal";
import { useCapsule } from "@/hooks/useCapsules";
import { formatCapsuleDelivery, formatDisplayDateTime, formatMonthYear, isCapsuleOverdue, isCapsuleFailed } from "@/utils/dates";
import { COLORS } from "@/constants";

export default function CapsuleRevealScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: capsule, isLoading } = useCapsule(id);

  if (isLoading || !capsule) {
    return (
      <Screen>
        <SafeAreaView className="flex-1 justify-center items-center">
          <BodyText muted>Opening...</BodyText>
        </SafeAreaView>
      </Screen>
    );
  }

  if (capsule.status !== "delivered") {
    const deliveryLabel = formatCapsuleDelivery(
      capsule.delivery_at,
      capsule.delivery_date
    );
    const isFailed = isCapsuleFailed(capsule);
    const isOverdue = isCapsuleOverdue(capsule);

    return (
      <Screen>
        <SafeAreaView className="flex-1 justify-center items-center px-8 gap-4">
          <WaxSeal
            state={isFailed || isOverdue ? "overdue" : "locked"}
            size={72}
            breathing={!isOverdue && !isFailed}
            label={
              isFailed
                ? `Could not deliver · ${deliveryLabel}`
                : isOverdue
                  ? `Due since ${deliveryLabel}`
                  : `Sealed until ${deliveryLabel}`
            }
          />
          <BodyText muted className="text-center">
            {isFailed
              ? "We could not deliver this capsule. The recipient email may be invalid."
              : isOverdue
                ? "The delivery time has passed. It will be sent to the recipient shortly."
                : `This capsule is still sealed until ${deliveryLabel}.`}
          </BodyText>
          <Pressable onPress={() => router.back()}>
            <BodyText className="text-dusk">Go back</BodyText>
          </Pressable>
        </SafeAreaView>
      </Screen>
    );
  }

  const writtenDate = formatMonthYear(capsule.created_at.split("T")[0]);
  const openedDate = capsule.delivered_at
    ? formatDisplayDateTime(capsule.delivered_at)
    : formatCapsuleDelivery(capsule.delivery_at, capsule.delivery_date);

  const handleShare = async () => {
    await Share.share({
      message: capsule.body,
      title: capsule.title ?? "A message from the past",
    });
  };

  return (
    <Screen>
      <SafeAreaView className="flex-1">
        <View className="flex-row justify-between items-center px-6 pt-4">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Close"
            className="p-2"
          >
            <X color={COLORS.ink} size={24} />
          </Pressable>
          <Pressable
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share message"
            className="p-2"
          >
            <Share2 color={COLORS.dusk} size={22} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 32,
            paddingTop: 24,
            paddingBottom: 64,
            flexGrow: 1,
            justifyContent: "center",
          }}
        >
          <Animated.View entering={FadeIn.duration(600)} className="items-center mb-10">
            <WaxSeal state="delivered" size={64} />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(800).delay(200)} className="gap-8">
            <BodyText muted className="text-center text-sm">
              Written {writtenDate}, opened {openedDate}
            </BodyText>

            {capsule.title ? (
              <Animated.Text
                entering={FadeInDown.duration(800).delay(300)}
                className="font-display text-ink text-2xl text-center tracking-wide"
              >
                {capsule.title}
              </Animated.Text>
            ) : null}

            <Animated.Text
              entering={FadeInDown.duration(800).delay(400)}
              className="font-body text-ink text-lg leading-8 text-center"
            >
              {capsule.body}
            </Animated.Text>

            {capsule.photo_url ? (
              <Animated.View entering={FadeInDown.duration(800).delay(500)}>
                <Image
                  source={{ uri: capsule.photo_url }}
                  className="w-full h-64 rounded-card"
                  resizeMode="cover"
                  accessibilityLabel="Capsule photo"
                />
              </Animated.View>
            ) : null}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
