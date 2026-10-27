import { Modal, Pressable, View } from 'react-native'

import { Image } from 'expo-image'

import CloseSvg from '@/assets/icons/close.svg'

type Props = {
  uri: string | null
  onClose: () => void
}

// Figma: 이미지크게보기 — 오버레이 #07091C 60%, 흰 프레임(r16, 8pt inset) 안에 이미지(r12) + 우상단 닫기
export function ImageViewerModal({ uri, onClose }: Props) {
  return (
    <Modal visible={uri !== null} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 items-center justify-center bg-[rgba(7,9,28,0.6)] px-[26px]"
        onPress={onClose}
        accessibilityLabel="닫기"
      >
        <View className="aspect-[349/495] w-full max-w-[349px] rounded-[16px] bg-white p-2">
          {uri && (
            <Image
              source={{ uri }}
              style={{ width: '100%', height: '100%', borderRadius: 12 }}
              contentFit="cover"
            />
          )}
          <Pressable
            hitSlop={8}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="닫기"
            className="absolute right-2 top-2 h-[45px] w-[45px] items-center justify-center"
          >
            <CloseSvg width={24} height={24} color="#07091C" />
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  )
}
