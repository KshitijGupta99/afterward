import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

export async function pickImage(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.7,
    aspect: [4, 3],
  });

  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0].uri;
}

export async function readImageBytes(uri: string): Promise<Uint8Array> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64ToUint8Array(base64);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function getFileExtension(uri: string): string {
  const match = uri.match(/\.(\w+)(?:\?|$)/);
  return match?.[1] ?? "jpg";
}
