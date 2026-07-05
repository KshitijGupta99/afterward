import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  ScrollView,
  Pressable,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Lock, Plus } from "lucide-react-native";
import { Screen, Heading } from "@/components/layout/Screen";
import { AppHeader } from "@/components/layout/AppHeader";
import { Input, TextArea } from "@/components/ui/Input";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { DeliveryDateTimeField } from "@/components/forms/DatePickerField";
import { useAuth } from "@/hooks/useAuth";
import { useCreateCapsule } from "@/hooks/useCapsules";
import { capsuleSchema, type CapsuleFormData } from "@/utils/validation";
import { pickImage } from "@/utils/image";
import {
  addYears,
  getNextBirthday,
  withDefaultMorningTime,
  isDeliveryInFuture,
  isValidBirthdate,
  formatDisplayDate,
} from "@/utils/dates";
import { DATE_PRESETS, COLORS, SHADOW_STYLES } from "@/constants";
import { saveDraft, loadDraft, clearDraft, getBirthdate } from "@/storage/mmkv";
import { draftFromForm } from "@/services/capsules";
import { cn } from "@/utils/cn";

export default function NewCapsuleScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const createMutation = useCreateCapsule();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [locking, setLocking] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>("oneYear");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CapsuleFormData>({
    resolver: zodResolver(capsuleSchema),
    defaultValues: {
      title: "",
      body: "",
      isSelf: true,
      recipientEmail: "",
      deliveryAt: withDefaultMorningTime(addYears(new Date(), 1)),
    },
  });

  const isSelf = watch("isSelf");

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      const legacyAt =
        draft.deliveryAt ??
        (draft as { deliveryDate?: string }).deliveryDate ??
        withDefaultMorningTime(addYears(new Date(), 1));
      reset({
        title: draft.title,
        body: draft.body,
        isSelf: draft.isSelf,
        recipientEmail: draft.recipientEmail,
        deliveryAt: legacyAt.includes("T")
          ? legacyAt
          : withDefaultMorningTime(new Date(legacyAt + "T12:00:00")),
      });
      if (draft.photoUri) setPhotoUri(draft.photoUri);
    }
  }, [reset]);

  const persistDraft = useCallback(() => {
    const values = watch();
    saveDraft(draftFromForm({ ...values, photoUri }));
  }, [watch, photoUri]);

  useEffect(() => {
    const interval = setInterval(persistDraft, 3000);
    return () => clearInterval(interval);
  }, [persistDraft]);

  const storedBirthdate = profile?.birthdate ?? getBirthdate() ?? "";

  const applyPreset = (key: string) => {
    setSelectedPreset(key);
    const today = new Date();

    if (key === "oneYear") {
      setValue("deliveryAt", withDefaultMorningTime(addYears(today, 1)));
    } else if (key === "fiveYears") {
      setValue("deliveryAt", withDefaultMorningTime(addYears(today, 5)));
    } else if (key === "tenYears") {
      setValue("deliveryAt", withDefaultMorningTime(addYears(today, 10)));
    } else if (key === "birthday") {
      const birthdate = storedBirthdate;
      if (birthdate && isValidBirthdate(birthdate)) {
        setValue("deliveryAt", getNextBirthday(birthdate));
      } else {
        Alert.alert(
          "Birthdate needed",
          "Add your birthdate in Settings to use the birthday preset."
        );
      }
    }
  };

  const handlePickImage = async () => {
    const uri = await pickImage();
    if (uri) setPhotoUri(uri);
  };

  const handleRemovePhoto = () => {
    setPhotoUri(null);
    const values = watch();
    saveDraft(draftFromForm({ ...values, photoUri: null }));
  };

  const onSubmit = async (data: CapsuleFormData) => {
    if (!user?.email) return;

    if (!isDeliveryInFuture(data.deliveryAt)) {
      Alert.alert(
        "Choose a later time",
        "That delivery time has already passed. Pick a time at least a minute from now."
      );
      return;
    }

    setLocking(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await createMutation.mutateAsync({
      userId: user.id,
      creatorEmail: user.email,
      title: data.title,
      body: data.body,
      photoUri,
      isSelf: data.isSelf,
      recipientEmail: data.isSelf ? user.email : data.recipientEmail!,
      deliveryAt: data.deliveryAt,
    });

    if (!result) {
      setLocking(false);
      Alert.alert("Could not lock capsule", "Please check your connection and try again.");
      return;
    }

    clearDraft();
    reset({
      title: "",
      body: "",
      isSelf: true,
      recipientEmail: "",
      deliveryAt: withDefaultMorningTime(addYears(new Date(), 1)),
    });
    setPhotoUri(null);
    setSelectedPreset("oneYear");
    await new Promise((r) => setTimeout(r, 600));
    setLocking(false);
    router.replace("/(tabs)/vault");
  };

  const presetYear = (years: number) => String(new Date().getFullYear() + years);

  return (
    <Screen>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <AppHeader
          title="New Capsule"
          showBack
          onBack={() => router.push("/(tabs)/vault")}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
          className="flex-1"
        >
          <ScrollView
            ref={scrollRef}
            className="flex-1"
            contentContainerStyle={{
              padding: 24,
              paddingBottom: 48 + keyboardHeight,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            <Heading className="text-2xl mb-5">What would you like to say?</Heading>

            <Controller
              control={control}
              name="body"
              render={({ field: { onChange, value } }) => (
                <TextArea
                  value={value}
                  onChangeText={onChange}
                  placeholder="Write a message to the future self or a loved one..."
                  hint="Securely encrypted"
                  card
                  error={errors.body?.message}
                  onFocus={() => scrollRef.current?.scrollTo({ y: 60, animated: true })}
                />
              )}
            />

            <View className="mt-6 mb-2">
              <SectionLabel>Add a memory (optional)</SectionLabel>
            </View>
            <View className="flex-row gap-3 mb-6">
              {!photoUri ? (
                <Pressable
                  onPress={handlePickImage}
                  className="flex-1 aspect-square border-2 border-dashed border-lavender-deep rounded-card bg-lavender/50 items-center justify-center"
                  accessibilityRole="button"
                  accessibilityLabel="Add photo"
                >
                  <View className="w-10 h-10 rounded-full border border-accent items-center justify-center mb-2">
                    <Plus color={COLORS.ink} size={20} />
                  </View>
                  <Text className="font-body text-xs text-muted">Photo </Text>
                </Pressable>
              ) : (
                <View className="flex-1 aspect-square rounded-card overflow-hidden relative">
                  <Image
                    source={{ uri: photoUri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <Pressable
                    onPress={handleRemovePhoto}
                    className="absolute top-2 right-2 bg-surface/90 rounded-pill px-3 py-1"
                  >
                    <Text className="font-body text-xs text-ink">Remove</Text>
                  </Pressable>
                </View>
              )}
              {photoUri ? (
                <Pressable
                  onPress={handlePickImage}
                  className="flex-1 aspect-square border-2 border-dashed border-lavender-deep rounded-card bg-lavender/30 items-center justify-center"
                >
                  <Text className="font-body text-xs text-muted">Change</Text>
                </Pressable>
              ) : null}
            </View>

            <View className="bg-lavender rounded-card p-4 mb-6">
              <SectionLabel className="mb-3">Recipient</SectionLabel>
              <View className="flex-row bg-lavender-deep/40 rounded-pill p-1">
                <RecipientPill
                  label="Send to myself"
                  selected={isSelf}
                  onPress={() => setValue("isSelf", true)}
                />
                <RecipientPill
                  label="Send to someone"
                  selected={!isSelf}
                  onPress={() => setValue("isSelf", false, { shouldValidate: false })}
                />
              </View>
            </View>

            {!isSelf && (
              <Controller
                control={control}
                name="recipientEmail"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Their email"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    disableAutofill
                    variant="pill"
                    error={errors.recipientEmail?.message}
                    className="mb-6"
                  />
                )}
              />
            )}

            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Title (optional)"
                  value={value}
                  onChangeText={onChange}
                  placeholder="A quiet note"
                  variant="pill"
                  className="mb-6"
                />
              )}
            />

            <SectionLabel className="mb-1">When should this open?</SectionLabel>
            <Text className="font-body text-sm text-muted mb-3">
              Select a delivery milestone
            </Text>

            <View className="flex-row gap-3 mb-3">
              {(
                [
                  ["oneYear", DATE_PRESETS.oneYear.label, 1],
                  ["fiveYears", DATE_PRESETS.fiveYears.label, 5],
                  ["tenYears", DATE_PRESETS.tenYears.label, 10],
                ] as const
              ).map(([key, label, years]) => (
                <MilestoneCard
                  key={key}
                  label={label}
                  year={presetYear(years)}
                  selected={selectedPreset === key}
                  onPress={() => applyPreset(key)}
                />
              ))}
            </View>

            <Pressable
              onPress={() => applyPreset("birthday")}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}
              className={cn(
                "border-2 border-dashed rounded-soft px-4 py-3.5 mb-3 min-h-[48px]",
                selectedPreset === "birthday"
                  ? "border-accent bg-lavender-deep/40"
                  : "border-lavender-deep bg-transparent"
              )}
              accessibilityRole="button"
              accessibilityLabel="Next birthday delivery"
            >
              <Text className="font-body text-base text-ink">Next birthday</Text>
              {isValidBirthdate(storedBirthdate) ? (
                <Text className="font-body text-xs text-muted">
                  {formatDisplayDate(storedBirthdate)}
                </Text>
              ) : null}
            </Pressable>

            <Controller
              control={control}
              name="deliveryAt"
              render={({ field: { onChange, value } }) => (
                <DeliveryDateTimeField
                  label=""
                  value={value}
                  onChange={(iso) => {
                    setSelectedPreset("custom");
                    onChange(iso);
                  }}
                  error={errors.deliveryAt?.message}
                  variant="dashed"
                />
              )}
            />

            <View className="items-center pt-8 pb-2">
              <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={createMutation.isPending || locking}
                accessibilityRole="button"
                accessibilityLabel="Lock capsule"
                style={[
                  { width: "100%", borderRadius: 9999, overflow: "hidden" },
                  SHADOW_STYLES.card,
                  (createMutation.isPending || locking) && { opacity: 0.5 },
                ]}
              >
                <LinearGradient
                  colors={[COLORS.gradientEnd, COLORS.gradientStart]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    minHeight: 56,
                    gap: 8,
                  }}
                >
                  <Lock color="#FFFFFF" size={18} />
                  <Text
                    className="font-display text-white text-lg"
                    style={{ lineHeight: 22, includeFontPadding: false }}
                  >
                    {locking ? "Locking..." : "Lock Capsule"}
                  </Text>
                </LinearGradient>
              </Pressable>
              <Text className="font-body text-xs text-muted text-center mt-4 px-4 leading-4">
                Once locked, this capsule cannot be opened or deleted until the unlock
                date.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Screen>
  );
}

function RecipientPill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{ flex: 1 }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <View
        className={cn("py-3 px-2 rounded-pill items-center", selected && "bg-surface")}
        style={selected ? SHADOW_STYLES.soft : undefined}
      >
        <Text
          className={cn(
            "font-body-medium text-sm text-center",
            selected ? "text-ink" : "text-muted"
          )}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function MilestoneCard({
  label,
  year,
  selected,
  onPress,
}: {
  label: string;
  year: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-1 bg-lavender rounded-soft py-4 items-center border",
        selected ? "border-accent bg-lavender-deep/50" : "border-transparent"
      )}
    >
      <Text className="font-body-medium text-sm text-ink">{label}</Text>
      <Text className="font-body text-xs text-muted mt-0.5">{year}</Text>
    </Pressable>
  );
}
