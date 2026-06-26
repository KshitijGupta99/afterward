import { useState } from "react";
import { View, Text, Pressable, Platform, NativeModules, Alert } from "react-native";
import {
  formatDisplayDateTime,
  toISOString,
  toLocalDateString,
  isDeliveryInFuture,
  bumpToNextValidDelivery,
  isSameLocalDay,
  formatDisplayDate,
  isValidBirthdate,
  parseBirthdateToDate,
} from "@/utils/dates";
import { Calendar } from "lucide-react-native";
import { COLORS } from "@/constants";
import { cn } from "@/utils/cn";

type DateTimePickerComponent = typeof import("@react-native-community/datetimepicker").default;
type DateTimePickerEvent = import("@react-native-community/datetimepicker").DateTimePickerEvent;

interface DeliveryDateTimeFieldProps {
  label?: string;
  value: string;
  onChange: (iso: string) => void;
  error?: string;
  minimumDate?: Date;
  variant?: "default" | "dashed";
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
  variant = "default",
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
          "flex-row items-center justify-center gap-2 rounded-soft px-4 py-3.5 min-h-[48px]",
          variant === "dashed"
            ? "border-2 border-dashed border-lavender-deep bg-transparent"
            : "bg-lavender border border-lavender-deep",
          error && "border-warning"
        )}
      >
        {variant === "dashed" ? (
          <>
            <Calendar color={COLORS.ink} size={18} />
            <Text className="font-body text-base text-ink">Custom Date</Text>
          </>
        ) : (
          <>
            <Text className="font-body text-base text-ink flex-1 pr-2">
              {value ? formatDisplayDateTime(value) : "Select date and time"}
            </Text>
            <Text className="font-body text-sm text-slate">Change</Text>
          </>
        )}
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
          display="calendar"
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
        <Text className="font-body text-sm text-warning">{error}</Text>
      ) : null}
    </View>
  );
}

/** @deprecated Use DeliveryDateTimeField */
export const DatePickerField = DeliveryDateTimeField;

interface BirthdateFieldProps {
  value: string;
  onChange: (yyyyMmDd: string) => void;
  error?: string;
}

function defaultBirthdatePickerValue(value: string): Date {
  if (value && isValidBirthdate(value)) {
    return parseBirthdateToDate(value);
  }
  const d = new Date();
  d.setFullYear(d.getFullYear() - 25);
  d.setHours(12, 0, 0, 0);
  return d;
}

export function BirthdateField({ value, onChange, error }: BirthdateFieldProps) {
  const DateTimePicker = loadDateTimePicker();
  const selected = defaultBirthdatePickerValue(value);
  const maxDate = new Date();
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);

  const [showIosPicker, setShowIosPicker] = useState(false);
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);

  const openPicker = () => {
    if (!DateTimePicker) return;
    if (Platform.OS === "android") {
      setShowAndroidPicker(true);
    } else {
      setShowIosPicker(true);
    }
  };

  const applyDate = (date: Date) => {
    onChange(toLocalDateString(date));
  };

  const handleIosChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === "dismissed") {
      setShowIosPicker(false);
      return;
    }
    if (date) {
      applyDate(date);
      setShowIosPicker(false);
    }
  };

  const handleAndroidChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowAndroidPicker(false);
    if (event.type === "dismissed" || !date) return;
    applyDate(date);
  };

  const displayValue = value && isValidBirthdate(value) ? formatDisplayDate(value) : null;

  return (
    <View className="gap-2">
      <Pressable
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={`Birthdate, ${displayValue ?? "not set"}`}
        style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
        className={cn(
          "bg-lavender border border-lavender-deep rounded-pill px-4 py-3.5 min-h-[48px]",
          error && "border-warning"
        )}
      >
        <Calendar color={COLORS.ink} size={18} />
        <Text className="font-body text-base text-ink flex-1">
          {displayValue ?? "Pick your birthdate"}
        </Text>
        <Text className="font-body text-sm text-slate">Change</Text>
      </Pressable>

      {!DateTimePicker ? (
        <Text className="font-body text-sm text-warning">
          Calendar requires a native rebuild. Run: npx expo prebuild --clean && npx expo run:android
        </Text>
      ) : null}

      {Platform.OS === "ios" && showIosPicker && DateTimePicker ? (
        <DateTimePicker
          value={selected}
          mode="date"
          display="spinner"
          minimumDate={minDate}
          maximumDate={maxDate}
          onChange={handleIosChange}
        />
      ) : null}

      {Platform.OS === "android" && showAndroidPicker && DateTimePicker ? (
        <DateTimePicker
          value={selected}
          mode="date"
          display="calendar"
          minimumDate={minDate}
          maximumDate={maxDate}
          onChange={handleAndroidChange}
        />
      ) : null}

      {error ? (
        <Text className="font-body text-sm text-warning">{error}</Text>
      ) : null}
    </View>
  );
}
