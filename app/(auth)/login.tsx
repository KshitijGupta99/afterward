import { useState } from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen, Heading, BodyText } from "@/components/layout/Screen";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginFormData } from "@/utils/validation";

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithEmail } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    const { error: authError } = await signInWithEmail(data.email);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.push({ pathname: "/(auth)/verify", params: { email: data.email } });
  };

  return (
    <Screen>
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-center px-8"
        >
          <View className="gap-8 max-w-sm w-full mx-auto">
            <View className="gap-3">
              <Heading>Sign in</Heading>
              <BodyText muted>
                Enter your email. We will send you a link to continue.
              </BodyText>
            </View>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value }, fieldState: { error: fieldError } }) => (
                <Input
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={fieldError?.message ?? error ?? undefined}
                />
              )}
            />

            <Button onPress={handleSubmit(onSubmit)} loading={isSubmitting}>
              Send magic link
            </Button>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Screen>
  );
}
