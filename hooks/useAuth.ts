import { useEffect } from "react";
import { supabase } from "@/supabase/client";
import { useAuthStore } from "@/hooks/useAuthStore";
import { fetchProfile } from "@/services/capsules";
import { getAuthRedirectUrl } from "@/utils/auth";

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
    return { error };
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
