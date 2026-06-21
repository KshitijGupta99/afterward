import { useState } from "react";
import { View, Text, Pressable, Platform, NativeModules, Alert } from "react-native";
import {
  formatDisplayDateTime,
  toISOString,
  isDeliveryInFuture,
  bumpToNextValidDelivery,
  isSameLocalDay,
} from "@/utils/dates";
import { cn } from "@/utils/cn";

type DateTimePickerComponent = typeof import("@react-native-community/datetimepicker").default;
type DateTimePickerEvent = import("@react-native-community/datetimepicker").DateTimePickerEvent;

interface DeliveryDateTimeFieldProps {
  label?: string;
  value: string;
  onChange: (iso: string) => void;
  error?: string;
  minimumDate?: Date;
}

type AndroidStep = "date" | "time" | null;

function parseISO(value: string): Date {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function isPickerAvailable(): boolean {
  return !!(
    NativeModules.RNCDatePicker ||
    NativeModules.RNDateTimePickerAndroid ||
    NativeModules.RNDateTimePicker
  );
}

function loadDateTimePicker(): DateTimePickerComponent | null {
  if (!isPickerAvailable()) return null;
  try {
    return require("@react-native-community/datetimepicker").default;
  } catch {
    return null;
  }
}

function showPastTimeAlert(isToday: boolean): void {
  Alert.alert(
    "Choose a later time",
    isToday
      ? "That time has already passed today. Pick a later time — use 24-hour format (e.g. 18:37 for 6:37 pm)."
      : "Delivery must be after the current date and time."
  );
}

export function DeliveryDateTimeField({
  label = "Delivery date and time",
  value,
  onChange,
  error,
  minimumDate = new Date(),
}: DeliveryDateTimeFieldProps) {
  const DateTimePicker = loadDateTimePicker();
  const selected = value ? parseISO(value) : minimumDate;

  const [showIosPicker, setShowIosPicker] = useState(false);
  const [androidStep, setAndroidStep] = useState<AndroidStep>(null);
  const [pendingDate, setPendingDate] = useState(selected);

  const openPicker = () => {
    if (!DateTimePicker) return;
    setPendingDate(selected);
    if (Platform.OS === "android") {
      setAndroidStep("date");
    } else {
      setShowIosPicker(true);
    }
  };

  const finishSelection = (date: Date) => {
    if (!isDeliveryInFuture(date)) {
      showPastTimeAlert(isSameLocalDay(date, new Date()));
      return;
    }
    onChange(toISOString(date));
  };

  const handleIosChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === "dismissed") {
      setShowIosPicker(false);
      return;
    }
    if (date) finishSelection(date);
  };

  const handleAndroidChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === "dismissed") {
      setAndroidStep(null);
      return;
    }
    if (!date) return;

    if (androidStep === "date") {
      const next = new Date(pendingDate);
      next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setPendingDate(bumpToNextValidDelivery(next));
      setAndroidStep("time");
      return;
    }

    if (androidStep === "time") {
      const final = new Date(pendingDate);
      final.setHours(date.getHours(), date.getMinutes(), 0, 0);
      finishSelection(final);
      setAndroidStep(null);
    }
  };

  return (
    <View className="gap-2">
      {label ? (
        <Text className="font-body text-sm text-ink/70">{label}</Text>
      ) : null}

      <Pressable
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={`Delivery time, ${value ? formatDisplayDateTime(value) : "not set"}`}
        className={cn(
          "flex-row items-center justify-between bg-mist/50 border border-mist rounded-soft px-4 py-3.5 min-h-[48px]",
          error && "border-amber"
        )}
      >
        <Text className="font-body text-base text-ink flex-1 pr-2">
          {value ? formatDisplayDateTime(value) : "Select date and time"}
        </Text>
        <Text className="font-body text-sm text-dusk">Change</Text>
      </Pressable>

      {!DateTimePicker ? (
        <Text className="font-body text-sm text-amber">
          Calendar requires a native rebuild. Run: npx expo prebuild --clean && npx expo run:android
        </Text>
      ) : null}

      {Platform.OS === "ios" && showIosPicker && DateTimePicker ? (
        <DateTimePicker
          value={selected}
          mode="datetime"
          display="spinner"
          minimumDate={minimumDate}
          onChange={handleIosChange}
        />
      ) : null}

      {Platform.OS === "android" && androidStep === "date" && DateTimePicker ? (
        <DateTimePicker
          value={pendingDate}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          onChange={handleAndroidChange}
        />
      ) : null}

      {Platform.OS === "android" && androidStep === "time" && DateTimePicker ? (
        <DateTimePicker
          value={pendingDate}
          mode="time"
          display="default"
          is24Hour
          onChange={handleAndroidChange}
        />
      ) : null}

      {error ? (
        <Text className="font-body text-sm text-amber">{error}</Text>
      ) : null}
    </View>
  );
}

/** @deprecated Use DeliveryDateTimeField */
export const DatePickerField = DeliveryDateTimeField;
