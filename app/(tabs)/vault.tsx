import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";
import { View, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { Screen, Heading, BodyText } from "@/components/layout/Screen";
import {
  CapsuleCard,
  CapsuleCardSkeleton,
  VaultSectionHeader,
} from "@/components/capsule/CapsuleCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useCapsules } from "@/hooks/useCapsules";
import { useNow } from "@/hooks/useNow";
import { isCapsuleOverdue, isCapsuleFailed } from "@/utils/dates";
import {
  isCapsuleOpened,
  canViewerOpenCapsule,
  isCapsuleSentToOthers,
} from "@/utils/capsule";
import type { Capsule } from "@/types";

type VaultItem =
  | { kind: "header"; id: string; title: string }
  | { kind: "capsule"; id: string; capsule: Capsule };

function buildVaultItems(
  capsules: Capsule[],
  nowMs: number,
  viewerUserId?: string,
  viewerEmail?: string | null
): VaultItem[] {
  const overdue = capsules.filter((c) => isCapsuleOverdue(c, nowMs));
  const failed = capsules.filter((c) => isCapsuleFailed(c));
  const sealed = capsules.filter(
    (c) => c.status === "locked" && !isCapsuleOverdue(c, nowMs)
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
  if (sealed.length) {
    items.push({ kind: "header", id: "hdr-sealed", title: "Sealed" });
    sealed.forEach((c) => items.push({ kind: "capsule", id: c.id, capsule: c }));
  }
  if (readyToOpen.length) {
    items.push({ kind: "header", id: "hdr-ready", title: "Ready to open" });
    readyToOpen.forEach((c) => items.push({ kind: "capsule", id: c.id, capsule: c }));
  }
  if (deliveredWaiting.length) {
    items.push({ kind: "header", id: "hdr-sent", title: "Delivered" });
    deliveredWaiting.forEach((c) =>
      items.push({ kind: "capsule", id: c.id, capsule: c })
    );
  }
  if (opened.length) {
    items.push({ kind: "header", id: "hdr-opened", title: "Opened" });
    opened.forEach((c) => items.push({ kind: "capsule", id: c.id, capsule: c }));
  }

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

  const overdueCount = useMemo(
    () => capsules?.filter((c) => isCapsuleOverdue(c, nowMs)).length ?? 0,
    [capsules, nowMs]
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
        <View className="px-6 pt-6 pb-4">
          <Heading>Vault</Heading>
          {overdueCount > 0 ? (
            <BodyText muted className="text-sm mt-2 text-amber">
              {overdueCount === 1
                ? "1 capsule is past its delivery time"
                : `${overdueCount} capsules are past their delivery time`}
            </BodyText>
          ) : null}
        </View>

        {isLoading ? (
          <View className="px-6">
            {[1, 2, 3].map((i) => (
              <CapsuleCardSkeleton key={i} />
            ))}
          </View>
        ) : !capsules?.length ? (
          <View className="flex-1 justify-center items-center px-8 gap-6">
            <BodyText muted className="text-center text-lg">
              Nothing here yet.{"\n"}Write something for a future day.
            </BodyText>
            <Button onPress={() => router.push("/(tabs)/new")}>
              Write a capsule
            </Button>
          </View>
        ) : (
          <View className="flex-1">
            <FlashList
              data={items}
              renderItem={renderItem}
              estimatedItemSize={120}
              getItemType={(item) => item.kind}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
              refreshControl={
                <RefreshControl
                  refreshing={isRefetching}
                  onRefresh={refetch}
                  tintColor="#3D4F5C"
                />
              }
            />
          </View>
        )}
      </SafeAreaView>
    </Screen>
  );
}
