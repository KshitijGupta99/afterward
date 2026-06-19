import { TextInput, View, Text, Platform, type TextInputProps } from "react-native";
import { cn } from "@/utils/cn";

const noAutofillProps: Partial<TextInputProps> = {
  autoCorrect: false,
  spellCheck: false,
  autoComplete: "off",
  textContentType: "none",
  ...(Platform.OS === "android" ? { importantForAutofill: "no" } : {}),
};

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
  disableAutofill?: boolean;
}

export function Input({
  label,
  error,
  className,
  disableAutofill = true,
  ...props
}: InputProps) {
  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="font-body text-sm text-ink/70">{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor="rgba(43, 42, 40, 0.35)"
        className={cn(
          "font-body text-base text-ink bg-mist/50 border border-mist rounded-soft px-4 py-3 min-h-[48px]",
          error && "border-amber",
          className
        )}
        accessibilityLabel={label}
        {...(disableAutofill ? noAutofillProps : {})}
        {...props}
      />
      {error ? (
        <Text className="font-body text-sm text-amber">{error}</Text>
      ) : null}
    </View>
  );
}

interface TextAreaProps extends TextInputProps {
  label?: string;
  error?: string;
  disableAutofill?: boolean;
}

export function TextArea({
  label,
  error,
  disableAutofill = true,
  ...props
}: TextAreaProps) {
  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="font-body text-sm text-ink/70">{label}</Text>
      ) : null}
      <TextInput
        multiline
        textAlignVertical="top"
        placeholderTextColor="rgba(43, 42, 40, 0.35)"
        className={cn(
          "font-body text-base text-ink bg-mist/50 border border-mist rounded-soft px-4 py-3 min-h-[160px]",
          error && "border-amber"
        )}
        accessibilityLabel={label}
        {...(disableAutofill ? noAutofillProps : {})}
        {...props}
      />
      {error ? (
        <Text className="font-body text-sm text-amber">{error}</Text>
      ) : null}
    </View>
  );
}
