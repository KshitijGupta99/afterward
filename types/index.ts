export type CapsuleStatus = "locked" | "delivered" | "failed";

export interface Profile {
  id: string;
  email: string;
  birthdate: string | null;
  expo_push_token: string | null;
  notifications_enabled: boolean;
  created_at: string;
}

export interface Capsule {
  id: string;
  user_id: string;
  title: string | null;
  body: string;
  photo_url: string | null;
  recipient_email: string;
  recipient_user_id: string | null;
  is_self: boolean;
  delivery_date: string;
  delivery_at: string | null;
  status: CapsuleStatus;
  created_at: string;
  delivered_at: string | null;
  opened_at: string | null;
}

export interface CapsuleDraft {
  title: string;
  body: string;
  photoUri: string | null;
  isSelf: boolean;
  recipientEmail: string;
  deliveryAt: string | null;
  savedAt: string;
}

export interface DeliveryNotificationPayload {
  capsuleId: string;
  type: "capsule_delivered";
}
