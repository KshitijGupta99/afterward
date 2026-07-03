import { useEffect } from "react";
import { supabase } from "@/supabase/client";
import { useAuthStore } from "@/hooks/useAuthStore";
import { fetchProfile } from "@/services/capsules";
import { getAuthRedirectUrl } from "@/utils/auth";

function normalizeAuthErrorMessage(raw: string): string {
  if (!raw) {
    return "Could not send the magic link. Please try again.";
  }

  try {
    const parsed = JSON.parse(raw) as {
      status?: number;
      statusText?: string;
    };

    if (parsed.status === 500) {
      return "Email delivery is unavailable right now. Check Supabase Auth SMTP settings for your domain and try again.";
    }

    if (parsed.status === 429) {
      return "Too many login attempts. Please wait a moment and try again.";
    }

    if (parsed.statusText) {
      return `Could not send magic link (${parsed.statusText}). Please try again.`;
    }
  } catch {
    // Keep the original message if it is not JSON.
  }

  if (raw.toLowerCase().includes("rate limit")) {
    return "Login email rate limit reached. Configure custom SMTP for production volume and try again.";
  }

  return raw;
}

export function useAuth() {
  const { session, user, profile, isLoading, setSession, setProfile, setLoading, reset } =
    useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, [setSession, setLoading]);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    fetchProfile(user.id).then((p) => {
      if (p) setProfile(p);
    });
  }, [user, setProfile]);

  const signInWithEmail = async (email: string) => {
    const redirectTo = getAuthRedirectUrl();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    return {
      error,
      message: error ? normalizeAuthErrorMessage(error.message) : null,
    };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    reset();
  };

  return {
    session,
    user,
    profile,
    isLoading,
    isAuthenticated: !!session,
    signInWithEmail,
    signOut,
  };
}
