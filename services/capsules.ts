import { supabase } from "@/supabase/client";
import { STORAGE_BUCKET } from "@/constants";
import { getFileExtension, readImageBytes } from "@/utils/image";
import { toLocalDateString } from "@/utils/dates";
import type { Capsule, CapsuleDraft } from "@/types";

export async function uploadPhoto(
  userId: string,
  uri: string
): Promise<string | null> {
  const ext = getFileExtension(uri);
  const path = `${userId}/${Date.now()}.${ext}`;
  const bytes = await readImageBytes(uri);

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, bytes, {
      contentType: `image/${ext === "png" ? "png" : "jpeg"}`,
      upsert: false,
    });

  if (error) {
    console.error("Upload failed:", error.message);
    return null;
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function createCapsule(params: {
  userId: string;
  creatorEmail: string;
  title?: string;
  body: string;
  photoUri?: string | null;
  isSelf: boolean;
  recipientEmail: string;
  deliveryAt: string;
}): Promise<Capsule | null> {
  let photoUrl: string | null = null;

  if (params.photoUri) {
    photoUrl = await uploadPhoto(params.userId, params.photoUri);
    if (!photoUrl) return null;
  }

  let recipientUserId: string | null = null;
  const { data: recipientProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", params.recipientEmail.toLowerCase())
    .maybeSingle();

  if (recipientProfile) {
    recipientUserId = recipientProfile.id;
  }

  const deliveryAt = params.deliveryAt;
  const deliveryDate = toLocalDateString(new Date(deliveryAt));

  const baseRow = {
    user_id: params.userId,
    title: params.title || null,
    body: params.body,
    photo_url: photoUrl,
    recipient_email: params.recipientEmail.toLowerCase(),
    recipient_user_id: recipientUserId,
    is_self: params.isSelf,
    delivery_date: deliveryDate,
    status: "locked" as const,
  };

  let { data, error } = await supabase
    .from("capsules")
    .insert({ ...baseRow, delivery_at: deliveryAt })
    .select()
    .single();

  if (error?.message?.includes("delivery_at")) {
    console.warn(
      "delivery_at column missing — run supabase/migrations/002_delivery_at.sql. Saving date only."
    );
    ({ data, error } = await supabase
      .from("capsules")
      .insert(baseRow)
      .select()
      .single());
  }

  if (error) {
    console.error("Create capsule failed:", error.message);
    return null;
  }

  return data;
}

export async function fetchUserCapsules(
  userId: string,
  userEmail?: string | null
): Promise<Capsule[]> {
  const email = userEmail?.toLowerCase().trim();
  const orFilter = email
    ? `user_id.eq.${userId},recipient_user_id.eq.${userId},and(recipient_email.eq.${email},status.eq.delivered)`
    : `user_id.eq.${userId},recipient_user_id.eq.${userId}`;

  const { data, error } = await supabase
    .from("capsules")
    .select("*")
    .or(orFilter)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Fetch capsules failed:", error.message);
    return [];
  }

  return data ?? [];
}

export async function fetchCapsule(id: string): Promise<Capsule | null> {
  const { data, error } = await supabase
    .from("capsules")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function markCapsuleOpened(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("capsules")
    .update({ opened_at: new Date().toISOString() })
    .eq("id", id)
    .is("opened_at", null);

  return !error;
}

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<{
    birthdate: string | null;
    expo_push_token: string | null;
    notifications_enabled: boolean;
  }>
) {
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  return !error;
}

export async function exportUserData(userId: string) {
  const { data: capsules } = await supabase
    .from("capsules")
    .select("*")
    .eq("user_id", userId);

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return { profile, capsules: capsules ?? [] };
}

export function draftFromForm(values: {
  title?: string;
  body: string;
  photoUri: string | null;
  isSelf: boolean;
  recipientEmail?: string;
  deliveryAt: string;
}): CapsuleDraft {
  return {
    title: values.title ?? "",
    body: values.body,
    photoUri: values.photoUri,
    isSelf: values.isSelf,
    recipientEmail: values.recipientEmail ?? "",
    deliveryAt: values.deliveryAt || null,
    savedAt: new Date().toISOString(),
  };
}
