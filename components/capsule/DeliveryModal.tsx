import { Modal, View, Text, Pressable } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Mail } from "lucide-react-native";
import { BodyText, Heading } from "@/components/layout/Screen";
import { GradientButton } from "@/components/ui/GradientButton";
import { ScalePressable } from "@/components/ui/ScalePressable";
import { COLORS, SHADOW_STYLES } from "@/constants";

interface DeliveryModalProps {
  visible: boolean;
  onOpen: () => void;
  onDismiss: () => void;
}

export function DeliveryModal({ visible, onOpen, onDismiss }: DeliveryModalProps) {
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onDismiss}>
      <Animated.View
        entering={FadeIn.duration(220)}
        className="flex-1 bg-slate/30 justify-center items-center px-8"
      >
        <Pressable className="absolute inset-0" onPress={onDismiss} accessibilityLabel="Dismiss" />
        <Animated.View
          entering={FadeInDown.duration(380).springify().damping(22)}
          className="bg-surface rounded-card p-8 w-full max-w-sm items-center gap-6 border border-lavender/50"
          style={SHADOW_STYLES.card}
        >
          <View className="w-16 h-16 rounded-full bg-lavender items-center justify-center">
            <Mail color={COLORS.ink} size={28} />
          </View>
          <View className="items-center gap-2">
            <Heading className="text-xl text-center">
              Something has been waiting for you
            </Heading>
            <BodyText muted className="text-center leading-5">
              A message written in the past is ready to be opened.
            </BodyText>
          </View>
          <View className="w-full gap-3">
            <GradientButton onPress={onOpen}>Open capsule</GradientButton>
            <ScalePressable onPress={onDismiss} className="py-3 items-center">
              <Text className="font-body text-muted">Later</Text>
            </ScalePressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
