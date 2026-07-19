import { Modal, Pressable, Text, View } from 'react-native'
import { moderateScale, scale, verticalScale } from 'react-native-size-matters'

type ConfirmDialogProps = {
  visible: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  visible,
  title,
  description,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View
          className="w-full items-center rounded-2xl bg-white px-5 py-6"
          style={{ maxWidth: scale(340) }}
        >
          <Text
            className="text-center font-semibold text-black"
            style={{ fontSize: moderateScale(24) }}
          >
            {title}
          </Text>
          <Text
            className="mt-3 text-center font-medium text-gray2"
            style={{ fontSize: moderateScale(16) }}
          >
            {description}
          </Text>
          <View className="mt-6 w-full flex-row gap-3">
            <Pressable
              hitSlop={8}
              onPress={onConfirm}
              className="flex-1 items-center justify-center rounded-lg bg-primary"
              style={{ height: verticalScale(50) }}
            >
              <Text className="font-medium text-white" style={{ fontSize: moderateScale(17) }}>
                확인
              </Text>
            </Pressable>
            <Pressable
              hitSlop={8}
              onPress={onCancel}
              className="flex-1 items-center justify-center rounded-lg border border-[#4A5198] bg-[#102343]"
              style={{ height: verticalScale(50) }}
            >
              <Text className="font-medium text-white" style={{ fontSize: moderateScale(17) }}>
                취소
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}
