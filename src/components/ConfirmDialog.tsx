import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native'

type ConfirmDialogProps = {
  visible: boolean
  title: string
  description: string
  onConfirm: () => void
  // Figma: 버튼 1개(단일 확인)짜리 팝업도 존재 — onCancel/cancelLabel 생략 시 확인 버튼만 중앙에 표시
  onCancel?: () => void
  confirmLoading?: boolean
  confirmLabel?: string
  cancelLabel?: string
  isError?: boolean
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
  isError = false,
}: ConfirmDialogProps) {
  const singleButton = !onCancel

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel ?? onConfirm}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full max-w-[340px] items-center rounded-2xl bg-[#FFFFFF] px-5 pb-6 pt-11">
          <Text className="text-center font-semibold text-black text-popup-lg">{title}</Text>
          <Text
            className={`mt-4 text-center font-medium text-small3 ${isError ? 'text-[#ea4335]' : 'text-gray2'}`}
          >
            {description}
          </Text>
          <View className={`mt-12 flex-row gap-2 ${singleButton ? '' : 'w-full'}`}>
            <Pressable
              hitSlop={8}
              onPress={onConfirm}
              disabled={confirmLoading}
              className={`h-[50px] items-center justify-center rounded-lg bg-primary ${
                singleButton ? 'w-[145px]' : 'flex-1'
              } ${confirmLoading ? 'opacity-70' : 'opacity-100'}`}
            >
              {confirmLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-medium text-white text-main">{confirmLabel}</Text>
              )}
            </Pressable>
            {onCancel ? (
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
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  )
}
