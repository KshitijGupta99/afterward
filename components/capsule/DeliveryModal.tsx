import { Modal, View, Pressable, Text } from "react-native";
import { Mail } from "lucide-react-native";
import { BodyText, Heading } from "@/components/layout/Screen";
import { GradientButton } from "@/components/ui/GradientButton";
import { COLORS } from "@/constants";

interface DeliveryModalProps {
  visible: boolean;
  onOpen: () => void;
  onDismiss: () => void;
}

export function DeliveryModal({ visible, onOpen, onDismiss }: DeliveryModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable
        className="flex-1 bg-slate/30 justify-center items-center px-8"
        onPress={onDismiss}
      >
        <Pressable
          className="bg-surface rounded-card p-8 w-full max-w-sm items-center gap-6 shadow-card border border-lavender/50"
          onPress={(e) => e.stopPropagation()}
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
            <GradientButton onPress={onOpen} className="w-full">
              Open capsule
            </GradientButton>
            <Pressable onPress={onDismiss} className="py-3 items-center">
              <Text className="font-body text-muted">Later</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
