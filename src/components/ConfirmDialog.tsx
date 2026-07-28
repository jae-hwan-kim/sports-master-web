import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native'

type ConfirmDialogProps = {
  visible: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
  confirmLoading?: boolean
  confirmLabel?: string
  cancelLabel?: string
}

export function ConfirmDialog({
  visible,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLoading = false,
  confirmLabel = '확인',
  cancelLabel = '취소',
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full max-w-[340px] items-center rounded-2xl bg-white px-5 pb-6 pt-11">
          <Text className="text-center font-semibold text-black text-popup-lg">{title}</Text>
          <Text className="mt-4 text-center font-medium text-gray2 text-small3">
            {description}
          </Text>
          <View className="mt-12 w-full flex-row gap-2">
            <Pressable
              hitSlop={8}
              onPress={onConfirm}
              disabled={confirmLoading}
              className={`h-[50px] flex-1 items-center justify-center rounded-lg bg-primary ${
                confirmLoading ? 'opacity-70' : 'opacity-100'
              }`}
            >
              {confirmLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-medium text-white text-main">{confirmLabel}</Text>
              )}
            </Pressable>
            <Pressable
              hitSlop={8}
              onPress={onCancel}
              disabled={confirmLoading}
              className={`h-[50px] flex-1 items-center justify-center rounded-lg border border-dialogBorder bg-dialogBg ${
                confirmLoading ? 'opacity-50' : 'opacity-100'
              }`}
            >
              <Text className="font-medium text-white text-main">{cancelLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}
