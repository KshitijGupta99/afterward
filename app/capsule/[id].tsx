import { useEffect } from "react";
import { View, ScrollView, Image, Pressable, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { PenLine, Lock, Archive, ChevronLeft } from "lucide-react-native";
import { Screen, BodyText } from "@/components/layout/Screen";
import { useAuth } from "@/hooks/useAuth";
import { useCapsule, useMarkCapsuleOpened } from "@/hooks/useCapsules";
import {
  formatCapsuleDelivery,
  formatDisplayDateTime,
  formatMonthYear,
  isCapsuleOverdue,
  isCapsuleFailed,
} from "@/utils/dates";
import { canViewerOpenCapsule, isCapsuleSentToOthers } from "@/utils/capsule";
import { COLORS } from "@/constants";

function DropCapBody({ text }: { text: string }) {
  if (!text.length) return null;
  const first = text[0];
  const rest = text.slice(1);

  return (
    <Text className="font-display text-slate text-lg leading-8 text-center px-2">
      <Text className="text-3xl text-accent leading-8">{first}</Text>
      {rest}
    </Text>
  );
}

export default function CapsuleRevealScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: capsule, isLoading } = useCapsule(id);
  const markOpened = useMarkCapsuleOpened();

  const canOpen = capsule
    ? canViewerOpenCapsule(capsule, user?.id, user?.email)
    : false;

  useEffect(() => {
    if (capsule?.status === "delivered" && canOpen && !capsule.opened_at && id) {
      markOpened.mutate(id);
    }
  }, [capsule?.status, capsule?.opened_at, canOpen, id]);

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
          <View className="w-20 h-20 rounded-full bg-lavender items-center justify-center">
            <Lock color={COLORS.ink} size={32} />
          </View>
          <Text className="font-display text-xl text-slate text-center">
            {isFailed
              ? "Delivery failed"
              : isOverdue
                ? "Awaiting delivery"
                : "Still locked"}
          </Text>
          <BodyText muted className="text-center leading-5">
            {isFailed
              ? "We could not deliver this capsule. The recipient email may be invalid."
              : isOverdue
                ? "The delivery time has passed. It will be sent to the recipient shortly."
                : `This capsule is sealed until ${deliveryLabel}.`}
          </BodyText>
          <Pressable onPress={() => router.back()} className="mt-4">
            <Text className="font-body-medium text-ink">Go back</Text>
          </Pressable>
        </SafeAreaView>
      </Screen>
    );
  }

  if (!canOpen) {
    const deliveredLabel = capsule.delivered_at
      ? formatDisplayDateTime(capsule.delivered_at)
      : formatCapsuleDelivery(capsule.delivery_at, capsule.delivery_date);

    return (
      <Screen>
        <SafeAreaView className="flex-1 justify-center items-center px-8 gap-4">
          <BodyText muted className="text-center leading-5">
            {isCapsuleSentToOthers(capsule, user?.id)
              ? `Delivered ${deliveredLabel} to ${capsule.recipient_email}. Only they can open it.`
              : "You do not have permission to open this capsule."}
          </BodyText>
          <Pressable onPress={() => router.back()}>
            <Text className="font-body-medium text-ink">Go back</Text>
          </Pressable>
        </SafeAreaView>
      </Screen>
    );
  }

  const writtenDate = formatMonthYear(capsule.created_at.split("T")[0]);
  const openedDate = capsule.opened_at
    ? formatDisplayDateTime(capsule.opened_at).split(",")[0]
    : capsule.delivered_at
      ? formatDisplayDateTime(capsule.delivered_at).split(",")[0]
      : formatCapsuleDelivery(capsule.delivery_at, capsule.delivery_date);

  return (
    <Screen>
      <SafeAreaView className="flex-1">
        <Pressable
          onPress={() => router.back()}
          className="px-6 pt-2 pb-1"
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <ChevronLeft color={COLORS.muted} size={24} />
        </Pressable>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 28,
            paddingTop: 8,
            paddingBottom: 48,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(500)} className="gap-2 mb-6">
            <View className="flex-row items-center gap-2">
              <PenLine color={COLORS.muted} size={14} />
              <Text className="font-body text-xs text-muted">
                Written {writtenDate}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Lock color={COLORS.muted} size={14} />
              <Text className="font-body text-xs text-muted">
                Opened {openedDate}
              </Text>
            </View>
          </Animated.View>

          <View className="h-px bg-lavender mb-6" />

          {capsule.photo_url ? (
            <Animated.View entering={FadeInDown.duration(600).delay(100)} className="mb-8">
              <Image
                source={{ uri: capsule.photo_url }}
                className="w-full aspect-square rounded-card"
                resizeMode="cover"
                accessibilityLabel="Capsule photo"
              />
            </Animated.View>
          ) : null}

          {capsule.title ? (
            <Animated.Text
              entering={FadeInDown.duration(600).delay(200)}
              className="font-display text-slate text-xl text-center mb-6"
            >
              {capsule.title}
            </Animated.Text>
          ) : null}

          <Animated.View entering={FadeInDown.duration(700).delay(300)}>
            <DropCapBody text={capsule.body} />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(600).delay(500)}
            className="items-center mt-12"
          >
            <View className="w-8 h-1 rounded-pill bg-lavender-deep mb-3" />
            <Text className="font-body text-[10px] text-muted uppercase tracking-widest mb-6">
              End of message
            </Text>

            <Pressable
              onPress={() => router.back()}
              className="flex-row items-center gap-2 bg-lavender rounded-pill px-6 py-3.5 shadow-soft"
              accessibilityRole="button"
              accessibilityLabel="Move to archive"
            >
              <Archive color={COLORS.ink} size={16} />
              <Text className="font-body-medium text-sm text-ink">Move to Archive</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
