import type { Capsule } from "@/types";

export function isCapsuleOpened(capsule: Capsule): boolean {
  return capsule.opened_at != null;
}

export function canViewerOpenCapsule(
  capsule: Capsule,
  viewerUserId?: string | null,
  viewerEmail?: string | null
): boolean {
  if (capsule.status !== "delivered") return false;

  const email = viewerEmail?.toLowerCase().trim();

  if (capsule.is_self) {
    return capsule.user_id === viewerUserId;
  }

  if (viewerUserId && capsule.recipient_user_id === viewerUserId) return true;
  if (email && capsule.recipient_email.toLowerCase() === email) return true;

  return false;
}

export function isCapsuleSentToOthers(
  capsule: Capsule,
  viewerUserId?: string | null
): boolean {
  return !capsule.is_self && capsule.user_id === viewerUserId;
}

export function isCapsuleReceivedByViewer(
  capsule: Capsule,
  viewerUserId?: string | null,
  viewerEmail?: string | null
): boolean {
  if (capsule.user_id === viewerUserId && capsule.is_self) return false;
  if (capsule.is_self && capsule.user_id === viewerUserId) return false;
  return canViewerOpenCapsule(capsule, viewerUserId, viewerEmail) ||
    (capsule.status === "delivered" &&
      !capsule.is_self &&
      (capsule.recipient_user_id === viewerUserId ||
        capsule.recipient_email.toLowerCase() === viewerEmail?.toLowerCase().trim()));
}

export function getRecipientLabel(capsule: Capsule): string {
  if (capsule.is_self) return "Future self";
  return capsule.recipient_email;
}

export type CapsuleCardRole = "inbox" | "outbox";

export function getCapsuleCardRole(
  capsule: Capsule,
  viewerUserId?: string | null
): CapsuleCardRole {
  return isCapsuleSentToOthers(capsule, viewerUserId) ? "outbox" : "inbox";
}
