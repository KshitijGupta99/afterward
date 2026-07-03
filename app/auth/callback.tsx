import { Redirect } from "expo-router";

/**
 * Bridge route for deep links that target /auth/callback.
 * Actual screen lives in app/(auth)/callback.tsx.
 */
export default function AuthCallbackAliasScreen() {
  return <Redirect href="/(auth)/callback" />;
}
