import { createMMKV } from "react-native-mmkv";
import type { CapsuleDraft } from "@/types";
import { DRAFT_STORAGE_KEY } from "@/constants";

export const storage = createMMKV({ id: "afterward" });

export function saveDraft(draft: CapsuleDraft): void {
  storage.set(DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

export function loadDraft(): CapsuleDraft | null {
  const raw = storage.getString(DRAFT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CapsuleDraft;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  storage.remove(DRAFT_STORAGE_KEY);
}

export function getBirthdate(): string | null {
  return storage.getString("birthdate") ?? null;
}

export function setBirthdate(date: string): void {
  storage.set("birthdate", date);
}
