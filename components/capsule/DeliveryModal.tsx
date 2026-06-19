import { Modal, View, Pressable } from "react-native";
import { BodyText, Heading } from "@/components/layout/Screen";
import { WaxSeal } from "@/components/capsule/WaxSeal";
import { Button } from "@/components/ui/Button";

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
        className="flex-1 bg-ink/30 justify-center items-center px-8"
        onPress={onDismiss}
      >
        <Pressable
          className="bg-paper rounded-card p-8 w-full max-w-sm items-center gap-6"
          onPress={(e) => e.stopPropagation()}
        >
          <WaxSeal state="delivered" size={64} />
          <View className="items-center gap-2">
            <Heading className="text-xl text-center">
              Something has been waiting for you
            </Heading>
            <BodyText muted className="text-center">
              A message written in the past is ready to be opened.
            </BodyText>
          </View>
          <View className="w-full gap-3">
            <Button onPress={onOpen}>Open capsule</Button>
            <Button variant="ghost" onPress={onDismiss}>
              Later
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
