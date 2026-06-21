import { View, Text } from "react-native";
import { WaxSeal } from "@/components/capsule/WaxSeal";
import {
  formatCapsuleDelivery,
  formatDisplayDateTime,
  isCapsuleOverdue,
  isCapsuleFailed,
} from "@/utils/dates";
import type { Capsule } from "@/types";

interface CapsuleCardProps {
  capsule: Capsule;
  onPress?: () => void;
  nowMs?: number;
}

export function CapsuleCard({ capsule, onPress, nowMs }: CapsuleCardProps) {
  const isDelivered = capsule.status === "delivered";
  const isFailed = isCapsuleFailed(capsule);
  const isOverdue = isCapsuleOverdue(capsule, nowMs);
  const deliveryLabel = formatCapsuleDelivery(
    capsule.delivery_at,
    capsule.delivery_date
  );

  const sealState = isDelivered
    ? "delivered"
    : isFailed
      ? "overdue"
      : isOverdue
        ? "overdue"
        : "locked";

  const dateLabel = isDelivered
    ? `Opened ${capsule.delivered_at ? formatDisplayDateTime(capsule.delivered_at) : deliveryLabel}`
    : isFailed
      ? `Could not deliver · ${deliveryLabel}`
      : isOverdue
        ? `Due since ${deliveryLabel}`
        : `Sealed until ${deliveryLabel}`;

  return (
    <View className="items-center py-6">
      <WaxSeal
        state={sealState}
        size={72}
        label={dateLabel}
        onPress={isDelivered ? onPress : undefined}
        breathing={!isDelivered && !isOverdue && !isFailed}
        accessibilityLabel={
          isDelivered
            ? `Open capsule from ${dateLabel}`
            : isFailed
              ? `Delivery failed for capsule due ${deliveryLabel}`
              : isOverdue
                ? `Capsule due since ${deliveryLabel}`
                : `Locked until ${deliveryLabel}`
        }
      />
      {isOverdue ? (
        <Text className="font-body text-amber text-xs mt-2 text-center px-4">
          Delivery time has passed — it will arrive shortly
        </Text>
      ) : null}
      {isFailed ? (
        <Text className="font-body text-amber text-xs mt-2 text-center px-4">
          Delivery failed — check the recipient email
        </Text>
      ) : null}
      {capsule.title && !isDelivered ? (
        <Text className="font-body text-ink/50 text-xs mt-1">{capsule.title}</Text>
      ) : null}
      {!capsule.is_self && !isDelivered ? (
        <Text className="font-body text-ink/40 text-xs mt-1">
          To {capsule.recipient_email}
        </Text>
      ) : null}
    </View>
  );
}

export function CapsuleCardSkeleton() {
  return (
    <View className="items-center py-6">
      <View className="w-[72px] h-[72px] rounded-full bg-mist" />
      <View className="w-24 h-3 rounded bg-mist mt-3" />
    </View>
  );
}

export function VaultSectionHeader({ title }: { title: string }) {
  return (
    <View className="pt-4 pb-2">
      <Text className="font-body text-ink/50 text-xs uppercase tracking-widest text-center">
        {title}
      </Text>
    </View>
  );
}
