import { useState } from "react";
import { View, ScrollView, Alert, Switch, Text } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { Screen, Heading, BodyText, Divider } from "@/components/layout/Screen";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile, exportUserData } from "@/services/capsules";
import { setBirthdate, getBirthdate } from "@/storage/mmkv";
import { supabase } from "@/supabase/client";
import { registerForPushNotifications } from "@/notifications";

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

  const saveBirthdate = async () => {
    if (!user || !birthdate) return;
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
        <ScrollView contentContainerStyle={{ padding: 24, gap: 32 }}>
          <Heading>Settings</Heading>

          <View className="gap-4">
            <BodyText className="font-body text-sm text-ink/70 uppercase tracking-wider">
              Profile
            </BodyText>
            <Input
              label="Email"
              value={user?.email ?? ""}
              editable={false}
            />
            <Input
              label="Birthdate (YYYY-MM-DD)"
              value={birthdate}
              onChangeText={setBirthdateLocal}
              placeholder="1990-03-15"
            />
            <Button onPress={saveBirthdate} loading={saving} variant="secondary">
              Save birthdate
            </Button>
          </View>

          <Divider />

          <View className="gap-4">
            <BodyText className="font-body text-sm text-ink/70 uppercase tracking-wider">
              Notifications
            </BodyText>
            <View className="flex-row items-center justify-between">
              <Text className="font-body text-base text-ink">Delivery alerts</Text>
              <Switch
                value={notifications}
                onValueChange={toggleNotifications}
                trackColor={{ false: "#E8E3DA", true: "#3D4F5C" }}
                thumbColor="#FAF7F2"
                accessibilityLabel="Delivery notifications"
              />
            </View>
            <BodyText muted className="text-sm">
              Quiet alerts when a capsule arrives. No sound or vibration.
            </BodyText>
          </View>

          <Divider />

          <View className="gap-3">
            <Button variant="secondary" onPress={handleExport}>
              Export my data
            </Button>
            <Button variant="ghost" onPress={handleSignOut}>
              Sign out
            </Button>
            <Button variant="ghost" onPress={handleDeleteAccount}>
              <Text className="font-body text-amber">Delete account</Text>
            </Button>
          </View>

          <BodyText muted className="text-xs text-center">
            Your messages are stored securely. Only you can read locked capsules.
          </BodyText>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
