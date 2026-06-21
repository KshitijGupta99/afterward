import { View, Text } from "react-native";
import { WaxSeal } from "@/components/capsule/WaxSeal";
import {
  formatCapsuleDelivery,
  formatDisplayDateTime,
  isCapsuleOverdue,
  isCapsuleFailed,
} from "@/utils/dates";
import {
  isCapsuleOpened,
  canViewerOpenCapsule,
  isCapsuleSentToOthers,
} from "@/utils/capsule";
import type { Capsule } from "@/types";

interface CapsuleCardProps {
  capsule: Capsule;
  onPress?: () => void;
  nowMs?: number;
  viewerUserId?: string | null;
  viewerEmail?: string | null;
}

export function CapsuleCard({
  capsule,
  onPress,
  nowMs,
  viewerUserId,
  viewerEmail,
}: CapsuleCardProps) {
  const isDelivered = capsule.status === "delivered";
  const isFailed = isCapsuleFailed(capsule);
  const isOverdue = isCapsuleOverdue(capsule, nowMs);
  const isOpened = isCapsuleOpened(capsule);
  const canOpen = canViewerOpenCapsule(capsule, viewerUserId, viewerEmail);
  const sentToOthers = isCapsuleSentToOthers(capsule, viewerUserId);

  const deliveryLabel = formatCapsuleDelivery(
    capsule.delivery_at,
    capsule.delivery_date
  );
  const deliveredLabel = capsule.delivered_at
    ? formatDisplayDateTime(capsule.delivered_at)
    : deliveryLabel;

  const sealState = isDelivered
    ? isOpened
      ? "delivered"
      : "overdue"
    : isFailed
      ? "overdue"
      : isOverdue
        ? "overdue"
        : "locked";

  const dateLabel = isDelivered
    ? sentToOthers
      ? isOpened
        ? `Opened by ${capsule.recipient_email}`
        : `Delivered to ${capsule.recipient_email} · ${deliveredLabel}`
      : isOpened
        ? `Opened ${formatDisplayDateTime(capsule.opened_at!)}`
        : `Arrived ${deliveredLabel}`
    : isFailed
      ? `Could not deliver · ${deliveryLabel}`
      : isOverdue
        ? `Due since ${deliveryLabel}`
        : `Sealed until ${deliveryLabel}`;

  const showTapHint = isDelivered && canOpen && !isOpened;

  return (
    <View className="items-center py-6">
      <WaxSeal
        state={sealState}
        size={72}
        label={dateLabel}
        onPress={canOpen ? onPress : undefined}
        breathing={!isDelivered && !isOverdue && !isFailed}
        accessibilityLabel={
          isDelivered
            ? sentToOthers
              ? `Delivered to ${capsule.recipient_email}`
              : isOpened
                ? `Opened ${dateLabel}`
                : `Ready to open, arrived ${deliveredLabel}`
            : isFailed
              ? `Delivery failed for capsule due ${deliveryLabel}`
              : isOverdue
                ? `Capsule due since ${deliveryLabel}`
                : `Locked until ${deliveryLabel}`
        }
      />
      {showTapHint ? (
        <Text className="font-body text-dusk text-xs mt-2 text-center px-4">
          Tap to open
        </Text>
      ) : null}
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
      {sentToOthers && isDelivered && !isOpened ? (
        <Text className="font-body text-ink/40 text-xs mt-2 text-center px-4">
          Waiting for them to open it
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
