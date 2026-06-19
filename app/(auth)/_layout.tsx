import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#FAF7F2" } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="callback" />
    </Stack>
  );
}
