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
  variant?: "default" | "pill";
}

export function Input({
  label,
  error,
  className,
  disableAutofill = true,
  variant = "default",
  ...props
}: InputProps) {
  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="font-body text-sm text-muted">{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor="rgba(117, 117, 117, 0.6)"
        className={cn(
          "font-body text-base text-ink bg-lavender border border-lavender-deep px-4 py-3 min-h-[48px]",
          variant === "pill" ? "rounded-pill" : "rounded-soft",
          error && "border-warning",
          className
        )}
        accessibilityLabel={label}
        {...(disableAutofill ? noAutofillProps : {})}
        {...props}
      />
      {error ? (
        <Text className="font-body text-sm text-warning">{error}</Text>
      ) : null}
    </View>
  );
}

interface TextAreaProps extends TextInputProps {
  label?: string;
  error?: string;
  disableAutofill?: boolean;
  hint?: string;
  card?: boolean;
}

export function TextArea({
  label,
  error,
  disableAutofill = true,
  hint,
  card = false,
  className,
  ...props
}: TextAreaProps) {
  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="font-body text-sm text-muted">{label}</Text>
      ) : null}
      <View
        className={cn(
          card && "bg-surface rounded-card p-4 border border-lavender shadow-soft"
        )}
      >
        <TextInput
          multiline
          textAlignVertical="top"
          placeholderTextColor="rgba(117, 117, 117, 0.5)"
          className={cn(
            "font-body text-base text-ink min-h-[160px]",
            !card && "bg-surface border border-lavender rounded-card px-4 py-3 min-h-[160px]",
            error && "border-warning",
            className
          )}
          accessibilityLabel={label}
          {...(disableAutofill ? noAutofillProps : {})}
          {...props}
        />
        {hint ? (
          <Text className="font-body text-xs text-muted/70 text-right mt-2">
            {hint}
          </Text>
        ) : null}
      </View>
      {error ? (
        <Text className="font-body text-sm text-warning">{error}</Text>
      ) : null}
    </View>
  );
}
