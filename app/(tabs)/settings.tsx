import { useState, useEffect } from "react";
import { View, ScrollView, Alert, Switch, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import {
  Bell,
  Download,
  LogOut,
  Trash2,
  Cake,
  Shield,
  ChevronLeft,
} from "lucide-react-native";
import { Screen, BodyText, Divider } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { BirthdateField } from "@/components/forms/DatePickerField";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { isValidBirthdate } from "@/utils/dates";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile, exportUserData } from "@/services/capsules";
import { setBirthdate, getBirthdate } from "@/storage/mmkv";
import { supabase } from "@/supabase/client";
import { registerForPushNotifications } from "@/notifications";
import { getInitials } from "@/utils/user";
import { COLORS, SHADOW_STYLES } from "@/constants";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [birthdate, setBirthdateLocal] = useState(
    profile?.birthdate ?? getBirthdate() ?? ""
  );
  const [notifications, setNotifications] = useState(
    profile?.notifications_enabled ?? false
  );
  const [saving, setSaving] = useState(false);
  const [birthdateError, setBirthdateError] = useState<string | undefined>();

  useEffect(() => {
    const stored = profile?.birthdate ?? getBirthdate();
    if (stored) setBirthdateLocal(stored);
  }, [profile?.birthdate]);

  const saveBirthdate = async () => {
    if (!user || !birthdate) return;
    if (!isValidBirthdate(birthdate)) {
      setBirthdateError("Pick a valid date in the past");
      Alert.alert("Invalid birthdate", "Please pick your birthdate using the calendar.");
      return;
    }
    setBirthdateError(undefined);
    setSaving(true);
    setBirthdate(birthdate);
    await updateProfile(user.id, { birthdate });
    setSaving(false);
  };

  const toggleNotifications = async (enabled: boolean) => {
    if (!user) return;

    if (enabled) {
      const { token, error } = await registerForPushNotifications(user.id);
      if (!token) {
        Alert.alert(
          "Notifications unavailable",
          error ??
            "Push notifications require Firebase setup. You can still use the app and receive capsules by email."
        );
        return;
      }
      setNotifications(true);
      return;
    }

    setNotifications(false);
    await updateProfile(user.id, {
      notifications_enabled: false,
      expo_push_token: null,
    });
  };

  const handleExport = async () => {
    if (!user) return;
    const data = await exportUserData(user.id);
    const json = JSON.stringify(data, null, 2);
    const path = `${FileSystem.cacheDirectory ?? ""}afterward-export.json`;
    await FileSystem.writeAsStringAsync(path, json);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete account",
      "This will permanently remove your account and all capsules. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!user) return;
            await supabase.from("capsules").delete().eq("user_id", user.id);
            await supabase.from("profiles").delete().eq("id", user.id);
            await signOut();
            router.replace("/");
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <Screen>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="flex-row items-center px-4 py-3 border-b border-lavender bg-surface">
          <Pressable
            onPress={() => router.back()}
            className="p-2"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft color={COLORS.ink} size={24} />
          </Pressable>
          <Text className="flex-1 font-display text-lg text-slate text-center mr-10">
            Settings
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
          <View className="items-center mb-8">
            <View className="w-16 h-16 rounded-full bg-lavender items-center justify-center mb-3">
              <Text className="font-body-medium text-lg text-ink">
                {getInitials(user?.email)}
              </Text>
            </View>
            <Text className="font-display text-xl text-slate">Your account</Text>
            <Text className="font-body text-sm text-muted mt-1">{user?.email}</Text>
          </View>

          <SettingsCard icon={Cake} title="Birthdate">
            <BodyText muted className="text-sm mb-3 leading-5">
              Used for the birthday delivery preset when creating capsules.
            </BodyText>
            <BirthdateField
              value={birthdate}
              onChange={(d) => {
                setBirthdateLocal(d);
                setBirthdateError(undefined);
              }}
              error={birthdateError}
            />
            <Button
              onPress={saveBirthdate}
              loading={saving}
              variant="secondary"
              className="mt-3"
            >
              Save birthdate
            </Button>
          </SettingsCard>

          <SettingsCard icon={Bell} title="Notifications">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="font-body text-base text-ink">Delivery alerts</Text>
                <BodyText muted className="text-sm mt-1">
                  Quiet alerts when a capsule arrives.
                </BodyText>
              </View>
              <Switch
                value={notifications}
                onValueChange={toggleNotifications}
                trackColor={{ false: COLORS.lavenderDeep, true: COLORS.gradientStart }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Delivery notifications"
              />
            </View>
          </SettingsCard>

          <SettingsCard icon={Shield} title="Privacy">
            <BodyText muted className="text-sm leading-5">
              Your messages are encrypted and stored securely. Only you can read locked
              capsules until they are delivered.
            </BodyText>
          </SettingsCard>

          <Divider className="my-6" />

          <SectionLabel className="mb-3">Data & account</SectionLabel>
          <View className="gap-3">
            <ActionRow icon={Download} label="Export my data" onPress={handleExport} />
            <ActionRow icon={LogOut} label="Sign out" onPress={handleSignOut} />
            <ActionRow
              icon={Trash2}
              label="Delete account"
              onPress={handleDeleteAccount}
              destructive
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Bell;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="bg-surface rounded-card p-5 mb-4 border border-lavender/50" style={SHADOW_STYLES.soft}>
      <View className="flex-row items-center gap-2 mb-3">
        <Icon color={COLORS.ink} size={18} strokeWidth={1.5} />
        <Text className="font-display text-lg text-slate">{title}</Text>
      </View>
      {children}
    </View>
  );
}

function ActionRow({
  icon: Icon,
  label,
  onPress,
  destructive,
}: {
  icon: typeof LogOut;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 bg-surface rounded-soft px-4 py-4 border border-lavender"
      accessibilityRole="button"
    >
      <Icon color={destructive ? COLORS.warning : COLORS.ink} size={18} />
      <Text
        className={`font-body text-base flex-1 ${destructive ? "text-warning" : "text-ink"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
