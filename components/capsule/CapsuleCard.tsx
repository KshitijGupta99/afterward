import { View, Text, Pressable } from "react-native";
import {
  Lock,
  Clock,
  Hourglass,
  AlertCircle,
  Mail,
  Image as ImageIcon,
} from "lucide-react-native";
import { COLORS } from "@/constants";
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
  getRecipientLabel,
  getCapsuleCardRole,
} from "@/utils/capsule";
import type { Capsule } from "@/types";

interface CapsuleCardProps {
  capsule: Capsule;
  onPress?: () => void;
  nowMs?: number;
  viewerUserId?: string | null;
  viewerEmail?: string | null;
}

const BADGE_STYLES = {
  locked: { bg: "bg-lavender", text: "text-muted" },
  read: { bg: "bg-success", text: "text-success-text" },
  ready: { bg: "bg-success", text: "text-success-text" },
  failed: { bg: "bg-warning/20", text: "text-warning" },
  waiting: { bg: "bg-lavender", text: "text-muted" },
  sent: { bg: "bg-lavender-deep", text: "text-ink" },
} as const;

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: keyof typeof BADGE_STYLES;
}) {
  const style = BADGE_STYLES[tone];
  return (
    <View className={`flex-row items-center px-2.5 py-1 rounded-pill ${style.bg}`}>
      <Text className={`font-body text-xs ${style.text}`}>{label}</Text>
    </View>
  );
}

function getCardCopy(
  capsule: Capsule,
  viewerUserId?: string | null,
  viewerEmail?: string | null,
  nowMs?: number
) {
  const isDelivered = capsule.status === "delivered";
  const isFailed = isCapsuleFailed(capsule);
  const isOverdue = isCapsuleOverdue(capsule, nowMs);
  const isOpened = isCapsuleOpened(capsule);
  const canOpen = canViewerOpenCapsule(capsule, viewerUserId, viewerEmail);
  const role = getCapsuleCardRole(capsule, viewerUserId);
  const deliveryLabel = formatCapsuleDelivery(
    capsule.delivery_at,
    capsule.delivery_date
  );

  const title =
    capsule.title ||
    (capsule.is_self ? "To My Future Self" : "A letter for someone");

  let badge: { label: string; tone: keyof typeof BADGE_STYLES };
  let subtitle: string;
  let footerLabel: string;
  let footerDate: string;

  if (isFailed) {
    badge = { label: "Failed", tone: "failed" };
    subtitle = "Could not deliver — check the recipient email";
    footerLabel = "Was due";
    footerDate = deliveryLabel.split(",").slice(0, 2).join(",") || deliveryLabel;
  } else if (isDelivered && isOpened) {
    badge = { label: "Read", tone: "read" };
    subtitle =
      role === "outbox"
        ? "They opened this memory"
        : "You opened this memory";
    footerLabel = "Opened";
    footerDate = capsule.opened_at
      ? formatDisplayDateTime(capsule.opened_at).split(",").slice(0, 2).join(",")
      : deliveryLabel;
  } else if (isDelivered && canOpen && !isOpened) {
    badge = { label: "Ready", tone: "ready" };
    subtitle = "Ready when you are — tap to open";
    footerLabel = "Arrived";
    footerDate = capsule.delivered_at
      ? formatDisplayDateTime(capsule.delivered_at).split(",").slice(0, 2).join(",")
      : deliveryLabel;
  } else if (isDelivered && role === "outbox") {
    badge = { label: "With them", tone: "sent" };
    subtitle = "Delivered — waiting for them to open";
    footerLabel = "Delivered";
    footerDate = capsule.delivered_at
      ? formatDisplayDateTime(capsule.delivered_at).split(",").slice(0, 2).join(",")
      : deliveryLabel;
  } else if (isOverdue) {
    badge = { label: "Sending", tone: "waiting" };
    subtitle = "Past its date — delivery is on the way";
    footerLabel = "Was due";
    footerDate = deliveryLabel.split(",").slice(0, 2).join(",") || deliveryLabel;
  } else if (role === "outbox") {
    badge = { label: "Locked", tone: "locked" };
    subtitle = `Sealed until ${deliveryLabel}`;
    footerLabel = "Arrives";
    footerDate = deliveryLabel.split(",").slice(0, 2).join(",") || deliveryLabel;
  } else {
    badge = { label: "Locked", tone: "locked" };
    subtitle = "Wait until the time is right…";
    footerLabel = "Unlocks";
    footerDate = deliveryLabel.split(",").slice(0, 2).join(",") || deliveryLabel;
  }

  return { title, badge, subtitle, footerLabel, footerDate, isFailed, isOverdue, canOpen, isDelivered, isOpened, role };
}

export function VaultSectionHeader({ title }: { title: string }) {
  return (
    <Text className="font-body-medium text-xs text-muted uppercase tracking-widest mb-3 mt-2">
      {title}
    </Text>
  );
}

export function CapsuleCard({
  capsule,
  onPress,
  nowMs,
  viewerUserId,
  viewerEmail,
}: CapsuleCardProps) {
  const sentToOthers = isCapsuleSentToOthers(capsule, viewerUserId);
  const {
    title,
    badge,
    subtitle,
    footerLabel,
    footerDate,
    isFailed,
    isOverdue,
    canOpen,
    isDelivered,
    isOpened,
    role,
  } = getCardCopy(capsule, viewerUserId, viewerEmail, nowMs);

  const recipient = getRecipientLabel(capsule);
  const hasPhoto = !!capsule.photo_url;
  const pressable = (isDelivered && canOpen) || (!isDelivered && !sentToOthers);

  const content = (
    <View className="bg-surface rounded-card p-5 mb-4 shadow-soft border border-lavender/50">
      <View className="flex-row justify-end mb-3">
        <StatusBadge {...badge} />
      </View>

      <View className="items-center mb-4">
        <View
          className={`w-16 h-16 rounded-full items-center justify-center ${
            isOverdue ? "border-2 border-dashed border-accent" : "bg-lavender"
          }`}
        >
          {isFailed ? (
            <AlertCircle color={COLORS.warning} size={28} />
          ) : isOverdue ? (
            <Clock color={COLORS.accent} size={28} />
          ) : isDelivered && canOpen && !isOpened ? (
            <Mail color={COLORS.ink} size={28} />
          ) : (
            <Lock color={COLORS.ink} size={28} />
          )}
        </View>
      </View>

      <Text className="font-display text-lg text-slate text-center mb-2">
        {title}
      </Text>

      <View className="flex-row items-center justify-center gap-1.5 mb-2">
        <Text className="font-body-medium text-xs text-muted uppercase tracking-wide">
          To
        </Text>
        <Text
          className="font-body text-sm text-ink"
          numberOfLines={1}
          accessibilityLabel={`Recipient ${recipient}`}
        >
          {recipient}
        </Text>
      </View>

      <Text className="font-body text-sm text-muted/80 text-center italic mb-3 px-2 leading-5">
        {subtitle}
      </Text>

      {(hasPhoto || role === "outbox") && (
        <View className="flex-row items-center justify-center gap-3 mb-3">
          {hasPhoto ? (
            <View className="flex-row items-center gap-1">
              <ImageIcon color={COLORS.muted} size={14} />
              <Text className="font-body text-xs text-muted">Photo attached</Text>
            </View>
          ) : null}
          {role === "outbox" ? (
            <Text className="font-body text-xs text-muted">You sent this</Text>
          ) : null}
        </View>
      )}

      <View className="h-px bg-lavender my-1" />

      <View className="flex-row items-center justify-between pt-3">
        <View className="flex-1 pr-2">
          <Text className="font-body-medium text-[10px] text-muted uppercase tracking-widest">
            {footerLabel}
          </Text>
          <Text className="font-display text-base text-slate mt-0.5">{footerDate}</Text>
        </View>
        {isDelivered && canOpen ? (
          <Pressable onPress={onPress} accessibilityRole="button">
            <Text className="font-body-medium text-sm text-slate">
              {isOpened ? "Revisit" : "Open"}
            </Text>
          </Pressable>
        ) : (
          <Hourglass color={COLORS.accent} size={18} />
        )}
      </View>
    </View>
  );

  if (pressable && onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button">
        {content}
      </Pressable>
    );
  }
  return content;
}

export function PlantMemoryCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Plant a new memory"
      className="border-2 border-dashed border-lavender-deep rounded-card p-8 items-center mb-6 bg-surface/50"
    >
      <View className="w-14 h-14 rounded-full bg-lavender items-center justify-center mb-3">
        <Text className="font-body text-2xl text-ink">+</Text>
      </View>
      <Text className="font-display text-lg text-slate mb-1">Plant a New Memory</Text>
      <Text className="font-body text-sm text-muted text-center">
        What would you like to say to the future?
      </Text>
    </Pressable>
  );
}

export function CapsuleCardSkeleton() {
  return (
    <View className="bg-surface rounded-card p-5 mb-4 h-52 border border-lavender">
      <View className="w-16 h-16 rounded-full bg-lavender self-center mb-4" />
      <View className="h-4 bg-lavender rounded self-center w-40 mb-2" />
      <View className="h-3 bg-lavender rounded self-center w-32 mb-3" />
      <View className="h-3 bg-lavender rounded self-center w-56" />
    </View>
  );
}
