import { Modal, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = {
  visible: boolean
  onClose: () => void
}

const INFO_ITEMS = [
  '리뷰는 링크를 통해 고객에게 요청할 수 있습니다.',
  '운동명인 앱을 이용해 예약한 고객이 아니더라도 리뷰 작성이 가능합니다. (앱 가입 필수)',
  '별점과 리뷰로 점수 통계를 내며, 매주 월요일에 갱신됩니다.',
  null, // 마지막 항목 — 특수 스타일
] as const

const LAST_ITEM_MAIN =
  '리뷰 삭제는 관리자의 검토를 통해 승인 처리되며, 욕설, 폭언 등의 리뷰는 삭제 될 수 있습니다. '
const LAST_ITEM_RED = '단, 반복적인 특정 리뷰는 삭제요청 기각 가능합니다.'
const LAST_ITEM_SUB = '\n(예: 불친절하다, 집중하지 않는다 등)'

export function ReviewInfoModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets()

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1 }} onPress={onClose}>
        {/* Speech bubble positioned absolutely below the i button */}
        <Pressable
          onPress={() => {
            /* prevent close when pressing inside bubble */
          }}
          style={{
            position: 'absolute',
            top: insets.top + 56,
            right: 16,
            maxWidth: 290,
          }}
        >
          {/* Tail (triangle pointing up-right) */}
          <View
            style={{
              alignSelf: 'flex-end',
              marginRight: 12,
              width: 0,
              height: 0,
              borderLeftWidth: 8,
              borderRightWidth: 8,
              borderBottomWidth: 10,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: '#E8E8E8',
            }}
          />
          {/* Bubble body */}
          <View
            className="rounded-xl bg-[#E8E8E8] p-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.1,
              shadowRadius: 6.35,
              elevation: 4,
            }}
          >
            <Text
              className="text-gray2 mb-3 text-small1"
              style={{ fontFamily: 'Pretendard-Medium' }}
            >
              리뷰 관리 INFORMATION
            </Text>

            {/* Bullet list */}
            {INFO_ITEMS.slice(0, 3).map((item, i) => (
              <View key={i} className="flex-row gap-1 mb-1">
                <Text
                  className="text-gray2 text-small2"
                  style={{ fontFamily: 'Pretendard-Medium', lineHeight: 16 }}
                >
                  •
                </Text>
                <Text
                  className="text-gray2 flex-1 text-small2"
                  style={{ fontFamily: 'Pretendard-Medium', lineHeight: 16 }}
                >
                  {item}
                </Text>
              </View>
            ))}

            {/* Last bullet item with red emphasis */}
            <View className="flex-row gap-1">
              <Text
                className="text-gray2 text-small2"
                style={{ fontFamily: 'Pretendard-Medium', lineHeight: 16 }}
              >
                •
              </Text>
              <Text
                className="text-gray2 flex-1 text-small2"
                style={{ fontFamily: 'Pretendard-Medium', lineHeight: 16 }}
              >
                {LAST_ITEM_MAIN}
                <Text className="text-[#EA4335]">{LAST_ITEM_RED}</Text>
                <Text className="text-[10px]">{LAST_ITEM_SUB}</Text>
              </Text>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
