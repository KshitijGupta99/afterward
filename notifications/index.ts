import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { updateProfile } from "@/services/capsules";
import { NOTIFICATION_COPY } from "@/constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function getEasProjectId(): string | undefined {
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId || projectId === "your-eas-project-id") {
    return undefined;
  }
  return projectId;
}

export async function registerForPushNotifications(
  userId: string
): Promise<{ token: string | null; error?: string }> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return { token: null, error: "Notification permission was not granted" };
    }

    const projectId = getEasProjectId();

    if (Platform.OS === "android" && !projectId) {
      return {
        token: null,
        error:
          "Push notifications need Firebase setup. Run eas init and add google-services.json, or enable notifications later in Settings.",
      };
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const token = tokenData.data;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("delivery", {
        name: "Capsule delivery",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [],
        sound: null,
        enableVibrate: false,
      });
    }

    await updateProfile(userId, {
      expo_push_token: token,
      notifications_enabled: true,
    });

    return { token };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not register for notifications";
    console.warn("Push registration skipped:", message);
    return { token: null, error: message };
  }
}

export function addNotificationListeners(
  onReceived: (capsuleId: string) => void,
  onResponse: (capsuleId: string) => void
) {
  const receivedSub = Notifications.addNotificationReceivedListener(
    (notification) => {
      const capsuleId = notification.request.content.data?.capsuleId;
      if (typeof capsuleId === "string") {
        onReceived(capsuleId);
      }
    }
  );

  const responseSub = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const capsuleId = response.notification.request.content.data?.capsuleId;
      if (typeof capsuleId === "string") {
        onResponse(capsuleId);
      }
    }
  );

  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}

export function getCapsuleIdFromNotification(
  notification: Notifications.Notification
): string | null {
  const capsuleId = notification.request.content.data?.capsuleId;
  return typeof capsuleId === "string" ? capsuleId : null;
}

export { NOTIFICATION_COPY };
