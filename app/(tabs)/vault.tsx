import { useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { View, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { Screen, Heading, BodyText } from "@/components/layout/Screen";
import { CapsuleCard, CapsuleCardSkeleton } from "@/components/capsule/CapsuleCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useCapsules } from "@/hooks/useCapsules";
import type { Capsule } from "@/types";

export default function VaultScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: capsules, isLoading, refetch, isRefetching } = useCapsules(
    user?.id,
    user?.email
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const renderItem = ({ item }: { item: Capsule }) => (
    <CapsuleCard
      capsule={item}
      onPress={() => router.push(`/capsule/${item.id}`)}
    />
  );

  return (
    <Screen>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-6 pt-6 pb-4">
          <Heading>Vault</Heading>
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
              data={capsules}
              renderItem={renderItem}
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
