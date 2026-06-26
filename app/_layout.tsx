import "../global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import { DMSans_400Regular, DMSans_500Medium } from "@expo-google-fonts/dm-sans";
import { useAuth } from "@/hooks/useAuth";
import { useAuthLinking } from "@/hooks/useAuthLinking";
import { DeliveryModal } from "@/components/capsule/DeliveryModal";
import { useAuthStore, useNotificationStore } from "@/hooks/useAuthStore";
import { addNotificationListeners } from "@/notifications";
import { COLORS } from "@/constants";
import { isSupabaseConfigured } from "@/utils/config";
import { ConfigErrorScreen } from "@/components/layout/ConfigError";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 2,
    },
  },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  useAuthLinking();
  const { isAuthenticated, isLoading } = useAuth();
  const isProcessingAuthLink = useAuthStore((s) => s.isProcessingAuthLink);
  const segments = useSegments();
  const router = useRouter();
  const { pendingCapsuleId, setPendingCapsuleId } = useNotificationStore();

  useEffect(() => {
    if (isLoading || isProcessingAuthLink) return;

    const inAuthGroup = segments[0] === "(auth)";
    const onLanding = !segments[0];

    if (!isAuthenticated && !inAuthGroup && !onLanding) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && (inAuthGroup || onLanding)) {
      router.replace("/(tabs)/vault");
    }
  }, [isAuthenticated, isLoading, isProcessingAuthLink, segments, router]);

  useEffect(() => {
    const cleanup = addNotificationListeners(
      (capsuleId) => setPendingCapsuleId(capsuleId),
      (capsuleId) => {
        setPendingCapsuleId(null);
        router.push(`/capsule/${capsuleId}`);
      }
    );
    return cleanup;
  }, [router, setPendingCapsuleId]);

  return (
    <>
      {children}
      <DeliveryModal
        visible={!!pendingCapsuleId}
        onOpen={() => {
          if (pendingCapsuleId) {
            const id = pendingCapsuleId;
            setPendingCapsuleId(null);
            router.push(`/capsule/${id}`);
          }
        }}
        onDismiss={() => setPendingCapsuleId(null)}
      />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
  });

  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  if (!configured) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ConfigErrorScreen />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthGate>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.paper },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="capsule/[id]"
                options={{ presentation: "modal", animation: "fade" }}
              />
            </Stack>
          </AuthGate>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
