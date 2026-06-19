import { useEffect } from "react";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import {
  createSessionFromUrl,
  handleInitialAuthUrl,
  isAuthCallbackUrl,
} from "@/utils/auth";
import { useAuthStore } from "@/hooks/useAuthStore";

/** Single deep-link listener for Supabase magic links — mount once in root layout */
export function useAuthLinking() {
  const router = useRouter();
  const setProcessingAuthLink = useAuthStore((s) => s.setProcessingAuthLink);

  useEffect(() => {
    const processUrl = async (url: string) => {
      if (!isAuthCallbackUrl(url)) return;

      setProcessingAuthLink(true);
      const result = await createSessionFromUrl(url);
      setProcessingAuthLink(false);

      if (result.ok) {
        router.replace("/(tabs)/vault");
      } else {
        router.replace({
          pathname: "/(auth)/callback",
          params: { error: result.error },
        });
      }
    };

    handleInitialAuthUrl().then((result) => {
      if (!result) return;
      if (result.ok) {
        router.replace("/(tabs)/vault");
      } else {
        router.replace({
          pathname: "/(auth)/callback",
          params: { error: result.error },
        });
      }
    });

    const subscription = Linking.addEventListener("url", ({ url }) => {
      processUrl(url);
    });

    return () => subscription.remove();
  }, [router, setProcessingAuthLink]);
}
