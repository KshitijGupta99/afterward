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
import { Screen, Heading, BodyText } from "@/components/layout/Screen";
import { Input, TextArea } from "@/components/ui/Input";
import { DeliveryDateTimeField } from "@/components/forms/DatePickerField";
import { WaxSeal } from "@/components/capsule/WaxSeal";
import { useAuth } from "@/hooks/useAuth";
import { useCreateCapsule } from "@/hooks/useCapsules";
import { capsuleSchema, type CapsuleFormData } from "@/utils/validation";
import { pickImage } from "@/utils/image";
import {
  formatDisplayDateTime,
  addYears,
  getNextBirthday,
  withDefaultMorningTime,
  isDeliveryInFuture,
} from "@/utils/dates";
import { DATE_PRESETS } from "@/constants";
import { saveDraft, loadDraft, clearDraft, getBirthdate } from "@/storage/mmkv";
import { draftFromForm } from "@/services/capsules";

export default function NewCapsuleScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const createMutation = useCreateCapsule();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [sealing, setSealing] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
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

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } =
    useForm<CapsuleFormData>({
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
  const deliveryAt = watch("deliveryAt");

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
      const birthdate = profile?.birthdate ?? getBirthdate();
      if (birthdate) {
        setValue("deliveryAt", getNextBirthday(birthdate));
      } else {
        Alert.alert(
          "Birthdate needed",
          "Add your birthdate in Settings to use this preset."
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

    setSealing(true);
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
      setSealing(false);
      Alert.alert("Could not seal capsule", "Please check your connection and try again.");
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
    setSelectedPreset(null);
    await new Promise((r) => setTimeout(r, 800));
    setSealing(false);
    router.replace("/(tabs)/vault");
  };

  return (
    <Screen>
      <SafeAreaView className="flex-1" edges={["top"]}>
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
            <Heading className="mb-6">New capsule</Heading>

            <View className="gap-5">
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Title (optional)"
                    value={value}
                    onChangeText={onChange}
                    placeholder="A quiet note"
                    onFocus={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
                  />
                )}
              />

              <Controller
                control={control}
                name="body"
                render={({ field: { onChange, value } }) => (
                  <TextArea
                    label="Message"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Write something for a future day..."
                    error={errors.body?.message}
                    onFocus={() => scrollRef.current?.scrollTo({ y: 80, animated: true })}
                  />
                )}
              />

              <View className="gap-2">
                <Text className="font-body text-sm text-ink/70">Photo (optional)</Text>
                {photoUri ? (
                  <View className="gap-3">
                    <Image
                      source={{ uri: photoUri }}
                      className="w-full h-40 rounded-soft"
                      resizeMode="cover"
                    />
                    <View className="flex-row gap-3">
                      <Pressable
                        onPress={handlePickImage}
                        className="flex-1 py-3 rounded-soft border border-mist bg-mist/30 items-center"
                        accessibilityRole="button"
                        accessibilityLabel="Change photo"
                      >
                        <Text className="font-body text-sm text-dusk">Change photo</Text>
                      </Pressable>
                      <Pressable
                        onPress={handleRemovePhoto}
                        className="flex-1 py-3 rounded-soft border border-mist bg-mist/30 items-center"
                        accessibilityRole="button"
                        accessibilityLabel="Remove photo"
                      >
                        <Text className="font-body text-sm text-ink/70">Remove photo</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable
                    onPress={handlePickImage}
                    className="border border-dashed border-mist rounded-soft p-4 items-center justify-center min-h-[100px] bg-mist/30"
                    accessibilityRole="button"
                    accessibilityLabel="Add photo"
                  >
                    <BodyText muted>Tap to add a photo</BodyText>
                  </Pressable>
                )}
              </View>

              <View className="gap-3">
                <Text className="font-body text-sm text-ink/70">Recipient</Text>
                <View className="flex-row gap-3">
                  <RecipientToggle
                    label="To myself"
                    selected={isSelf}
                    onPress={() => setValue("isSelf", true)}
                  />
                  <RecipientToggle
                    label="To someone else"
                    selected={!isSelf}
                    onPress={() => setValue("isSelf", false)}
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
                      error={errors.recipientEmail?.message}
                      onFocus={() =>
                        scrollRef.current?.scrollTo({ y: 320, animated: true })
                      }
                    />
                  )}
                />
              )}

              <View className="gap-3">
                <Text className="font-body text-sm text-ink/70">Delivery date and time</Text>
                <View className="flex-row flex-wrap gap-2">
                  {Object.entries(DATE_PRESETS).map(([key, preset]) => (
                    <PresetChip
                      key={key}
                      label={preset.label}
                      selected={selectedPreset === key}
                      onPress={() => applyPreset(key)}
                    />
                  ))}
                  <PresetChip
                    label="Next birthday"
                    selected={selectedPreset === "birthday"}
                    onPress={() => applyPreset("birthday")}
                  />
                </View>
                <Controller
                  control={control}
                  name="deliveryAt"
                  render={({ field: { onChange, value } }) => (
                    <DeliveryDateTimeField
                      value={value}
                      onChange={(iso) => {
                        setSelectedPreset("custom");
                        onChange(iso);
                      }}
                      error={errors.deliveryAt?.message}
                    />
                  )}
                />
              </View>

              <View className="items-center pt-6 pb-4">
                <WaxSeal
                  state={sealing ? "closing" : "locked"}
                  size={88}
                  label={
                    sealing
                      ? "Sealing..."
                      : `Seal until ${formatDisplayDateTime(deliveryAt)}`
                  }
                  onPress={handleSubmit(onSubmit)}
                  disabled={createMutation.isPending || sealing}
                  accessibilityLabel={`Seal until ${formatDisplayDateTime(deliveryAt)}`}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Screen>
  );
}

function RecipientToggle({
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
      className={`flex-1 py-3 px-4 rounded-soft border ${
        selected ? "bg-dusk border-dusk" : "bg-mist/30 border-mist"
      }`}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <Text
        className={`font-body text-sm text-center ${
          selected ? "text-paper" : "text-ink"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PresetChip({
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
      className={`py-2 px-3 rounded-soft border ${
        selected ? "border-dusk bg-dusk/10" : "border-mist bg-mist/30"
      }`}
    >
      <Text className="font-body text-sm text-ink">{label}</Text>
    </Pressable>
  );
}
