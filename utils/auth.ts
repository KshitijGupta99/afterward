import * as Linking from "expo-linking";
import { supabase } from "@/supabase/client";

/** Must match a route in app/(auth)/ and Supabase redirect allow list */
export const AUTH_CALLBACK_PATH = "auth/callback";

export function getAuthRedirectUrl(): string {
  return Linking.createURL(AUTH_CALLBACK_PATH);
}

export function parseAuthParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};

  const { queryParams } = Linking.parse(url);
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (typeof value === "string") params[key] = value;
    }
  }

  const hashIndex = url.indexOf("#");
  if (hashIndex !== -1) {
    const hash = url.slice(hashIndex + 1);
    for (const pair of hash.split("&")) {
      const [key, value] = pair.split("=");
      if (key && value) params[key] = decodeURIComponent(value);
    }
  }

  return params;
}

export type AuthLinkResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createSessionFromUrl(url: string): Promise<AuthLinkResult> {
  const params = parseAuthParams(url);
  const { access_token, refresh_token, code, token_hash, type } = params;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  if (token_hash && type) {
    const otpType =
      type === "signup" || type === "email"
        ? "email"
        : type === "magiclink"
          ? "magiclink"
          : "email";

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: otpType as "email" | "magiclink",
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  return { ok: false, error: "No auth tokens found in link" };
}

export async function handleInitialAuthUrl(): Promise<AuthLinkResult | null> {
  const initialUrl = await Linking.getInitialURL();
  if (!initialUrl) return null;
  if (!isAuthCallbackUrl(initialUrl)) return null;
  return createSessionFromUrl(initialUrl);
}

export function isAuthCallbackUrl(url: string): boolean {
  return (
    url.includes("auth/callback") ||
    url.includes("/verify") ||
    url.includes("access_token=") ||
    url.includes("code=") ||
    url.includes("token_hash=")
  );
}
