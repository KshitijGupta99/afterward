import { useState } from "react";
import { View, KeyboardAvoidingView, Platform, Text, Linking } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react-native";
import { Screen, Heading, BodyText } from "@/components/layout/Screen";
import { BrandHeader } from "@/components/layout/BrandHeader";
import { FadeInView } from "@/components/layout/FadeInView";
import { Input } from "@/components/ui/Input";
import { GradientButton } from "@/components/ui/GradientButton";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginFormData } from "@/utils/validation";
import { COLORS, SHADOW_STYLES } from "@/constants";

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithEmail } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
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
        <BrandHeader />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-center px-6"
        >
          <FadeInView index={0}>
            <View
              className="bg-surface rounded-card p-6 border border-lavender/50 max-w-sm w-full mx-auto"
              style={SHADOW_STYLES.card}
            >
              <View className="gap-2 mb-6">
                <Heading className="text-2xl">Welcome back.</Heading>
                <BodyText muted className="text-sm leading-5">
                  Enter your email to access your vault. We'll send you a secure magic link.
                </BodyText>
              </View>

              <Controller
                control={control}
                name="email"
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error: fieldError },
                }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="email@address.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    variant="pill"
                    error={fieldError?.message ?? error ?? undefined}
                    className="mb-5"
                  />
                )}
              />

              <GradientButton
                variant="login"
                shadow={false}
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
              >
                Send Link
              </GradientButton>

              <Text className="font-body text-xs text-muted text-center mt-5 leading-4">
                By continuing, you agree to our{" "}
                <Text
                  className="underline"
                  onPress={() => Linking.openURL("https://afterward.app/privacy")}
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </FadeInView>
        </KeyboardAvoidingView>

        <FadeInView index={1} variant="fade">
          <View className="items-center pb-6 gap-2 px-6">
            <Text className="font-body text-xs text-muted">
              © Afterward. Digital Legacy & Memories.
            </Text>
            <View className="flex-row items-center gap-1.5">
              <ShieldCheck color={COLORS.muted} size={14} />
              <Text className="font-body text-xs text-muted">
                Secured by end-to-end encryption
              </Text>
            </View>
          </View>
        </FadeInView>
      </SafeAreaView>
    </Screen>
  );
}
