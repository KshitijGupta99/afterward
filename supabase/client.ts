import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Capsule, Profile } from "@/types";
import { getSupabaseConfig, isSupabaseConfigured } from "@/utils/config";

let client: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY for EAS builds."
    );
  }
  return createClient(url, anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: "pkce",
    },
  });
}

/** Lazy singleton — avoids crashing at import when env vars are missing in release builds. */
export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createSupabaseClient();
  }
  return client;
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getSupabase(), prop, receiver);
    return typeof value === "function" ? value.bind(getSupabase()) : value;
  },
});

export { isSupabaseConfigured };

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at"> & { created_at?: string };
        Update: Partial<Profile>;
      };
      capsules: {
        Row: Capsule;
        Insert: Omit<Capsule, "id" | "created_at" | "delivered_at" | "status"> & {
          id?: string;
          status?: Capsule["status"];
          created_at?: string;
          delivered_at?: string | null;
        };
        Update: Partial<Capsule>;
      };
    };
  };
};
