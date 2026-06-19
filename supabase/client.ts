import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Capsule, Profile } from "@/types";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: "pkce",
  },
});

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
