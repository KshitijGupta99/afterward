import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";
import { View, RefreshControl, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { Star } from "lucide-react-native";
import { Screen, Heading, BodyText } from "@/components/layout/Screen";
import { AppHeader } from "@/components/layout/AppHeader";
import {
  CapsuleCard,
  CapsuleCardSkeleton,
  PlantMemoryCard,
  VaultSectionHeader,
} from "@/components/capsule/CapsuleCard";
import { useAuth } from "@/hooks/useAuth";
import { useCapsules } from "@/hooks/useCapsules";
import { useNow } from "@/hooks/useNow";
import { getInitials } from "@/utils/user";
import { isCapsuleOverdue, isCapsuleFailed } from "@/utils/dates";
import {
  isCapsuleOpened,
  canViewerOpenCapsule,
  isCapsuleSentToOthers,
} from "@/utils/capsule";
import { COLORS } from "@/constants";
import type { Capsule } from "@/types";

type VaultItem =
  | { kind: "header"; id: string; title: string }
  | { kind: "capsule"; id: string; capsule: Capsule }
  | { kind: "plant"; id: string };

function buildVaultItems(
  capsules: Capsule[],
  nowMs: number,
  viewerUserId?: string,
  viewerEmail?: string | null
): VaultItem[] {
  const overdue = capsules.filter((c) => isCapsuleOverdue(c, nowMs));
  const failed = capsules.filter((c) => isCapsuleFailed(c));
  const sealedSelf = capsules.filter(
    (c) =>
      c.status === "locked" &&
      !isCapsuleOverdue(c, nowMs) &&
      c.is_self &&
      c.user_id === viewerUserId
  );
  const outbox = capsules.filter(
    (c) =>
      c.status === "locked" &&
      !isCapsuleOverdue(c, nowMs) &&
      isCapsuleSentToOthers(c, viewerUserId)
  );
  const readyToOpen = capsules.filter(
    (c) =>
      c.status === "delivered" &&
      !isCapsuleOpened(c) &&
      canViewerOpenCapsule(c, viewerUserId, viewerEmail)
  );
  const deliveredWaiting = capsules.filter(
    (c) =>
      c.status === "delivered" &&
      !isCapsuleOpened(c) &&
      isCapsuleSentToOthers(c, viewerUserId)
  );
  const opened = capsules.filter(
    (c) => c.status === "delivered" && isCapsuleOpened(c)
  );

  const items: VaultItem[] = [];

  if (overdue.length) {
    items.push({ kind: "header", id: "hdr-overdue", title: "Ready to deliver" });
    overdue.forEach((c) => items.push({ kind: "capsule", id: c.id, capsule: c }));
  }
  if (failed.length) {
    items.push({ kind: "header", id: "hdr-failed", title: "Delivery failed" });
    failed.forEach((c) => items.push({ kind: "capsule", id: c.id, capsule: c }));
  }
  if (sealedSelf.length) {
    items.push({ kind: "header", id: "hdr-sealed", title: "Locked" });
    sealedSelf.forEach((c) => items.push({ kind: "capsule", id: c.id, capsule: c }));
  }
  if (outbox.length) {
    items.push({ kind: "header", id: "hdr-outbox", title: "Outbox" });
    outbox.forEach((c) => items.push({ kind: "capsule", id: c.id, capsule: c }));
  }
  if (readyToOpen.length) {
    items.push({ kind: "header", id: "hdr-ready", title: "Ready to open" });
    readyToOpen.forEach((c) => items.push({ kind: "capsule", id: c.id, capsule: c }));
  }
  if (deliveredWaiting.length) {
    items.push({
      kind: "header",
      id: "hdr-sent",
      title: "Sent — awaiting them",
    });
    deliveredWaiting.forEach((c) =>
      items.push({ kind: "capsule", id: c.id, capsule: c })
    );
  }
  if (opened.length) {
    items.push({ kind: "header", id: "hdr-opened", title: "Opened" });
    opened.forEach((c) => items.push({ kind: "capsule", id: c.id, capsule: c }));
  }

  items.push({ kind: "plant", id: "plant" });
  return items;
}

export default function VaultScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const nowMs = useNow(30_000);
  const { data: capsules, isLoading, refetch, isRefetching } = useCapsules(
    user?.id,
    user?.email
  );

  const items = useMemo(
    () =>
      capsules ? buildVaultItems(capsules, nowMs, user?.id, user?.email) : [],
    [capsules, nowMs, user?.id, user?.email]
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const renderItem = ({ item }: { item: VaultItem }) => {
    if (item.kind === "header") {
      return <VaultSectionHeader title={item.title} />;
    }
    if (item.kind === "plant") {
      return <PlantMemoryCard onPress={() => router.push("/(tabs)/new")} />;
    }
    return (
      <CapsuleCard
        capsule={item.capsule}
        nowMs={nowMs}
        viewerUserId={user?.id}
        viewerEmail={user?.email}
        onPress={() => router.push(`/capsule/${item.capsule.id}`)}
      />
    );
  };

  return (
    <Screen>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <AppHeader
          showSearch
          avatarInitials={getInitials(user?.email)}
          onAvatarPress={() => router.push("/(tabs)/settings")}
        />

        {isLoading ? (
          <View className="px-6 pt-6">
            {[1, 2, 3].map((i) => (
              <CapsuleCardSkeleton key={i} />
            ))}
          </View>
        ) : !capsules?.length ? (
          <View className="flex-1 px-8">
            <LinearGradient
              colors={["#F3F4FF", COLORS.paper, COLORS.paper]}
              className="flex-1 items-center justify-center"
            >
              <View className="absolute top-24 left-16 w-2 h-2 rounded-full bg-accent" />
              <View className="w-24 h-24 rounded-full bg-surface items-center justify-center shadow-card mb-8">
                <Star color={COLORS.slate} size={36} fill={COLORS.lavender} />
              </View>
              <Heading className="text-center text-2xl mb-3">
                Your vault is quiet.
              </Heading>
              <BodyText muted className="text-center text-base leading-6 mb-8 px-4">
                Start your first capsule to send a message across time.
              </BodyText>
              <Pressable
                onPress={() => router.push("/(tabs)/new")}
                className="bg-slate rounded-pill px-8 py-4 shadow-card"
                accessibilityRole="button"
              >
                <Text className="font-body-medium text-white text-base">
                  + Create your first capsule
                </Text>
              </Pressable>
              <Text className="font-body text-[10px] text-muted uppercase tracking-widest mt-16">
                Preserving wisdom • Encrypting love
              </Text>
            </LinearGradient>
          </View>
        ) : (
          <View className="flex-1">
            <View className="px-6 pt-5 pb-2">
              <Heading className="text-2xl">Memories in Waiting</Heading>
              <BodyText muted className="text-sm mt-2 leading-5">
                A gallery of your digital legacies—some resting, some ready to be
                rediscovered.
              </BodyText>
            </View>
            <FlashList
              data={items}
              renderItem={renderItem}
              getItemType={(item) => item.kind}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
              refreshControl={
                <RefreshControl
                  refreshing={isRefetching}
                  onRefresh={refetch}
                  tintColor={COLORS.slate}
                />
              }
            />
          </View>
        )}
      </SafeAreaView>
    </Screen>
  );
}
