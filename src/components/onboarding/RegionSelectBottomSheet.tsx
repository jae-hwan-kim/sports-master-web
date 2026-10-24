import { useCallback } from 'react'
import { FlatList, Modal, Pressable, View } from 'react-native'

import { Text } from '@/components/AppText'
import { useScreenInsets } from '@/hooks/useScreenInsets'

// 서버에서 지역 목록을 받기 전까지 사용하는 임시 목록 — GET /regions 연동 시 props로 주입
const MOCK_REGIONS = [
  '서울',
  '경기',
  '인천',
  '강원',
  '충북',
  '충남',
  '세종',
  '대전',
  '전북',
  '전남·광주',
  '대구',
  '경북',
  '부산',
  '울산',
  '경남',
  '제주',
  '전국',
]

type Props = {
  visible: boolean
  selectedRegions: string[]
  // regions prop: 서버 데이터 연동 후 외부에서 주입 — 없으면 MOCK_REGIONS 사용
  regions?: string[]
  onToggle: (region: string) => void
  onClose: () => void
  onConfirm: () => void
}

function CheckCircle({ selected }: { selected: boolean }) {
  return (
    <View
      className={`h-5 w-5 items-center justify-center rounded-full border-[1.5px] ${
        selected ? 'border-[#C6A75E] bg-[#C6A75E]' : 'border-[#4A5169]'
      }`}
    >
      {selected && (
        <Text
          style={{ fontSize: 10, lineHeight: 13, color: '#07091C', fontFamily: 'Pretendard-Bold' }}
        >
          ✓
        </Text>
      )}
    </View>
  )
}

function Separator() {
  return <View className="mx-5 h-px bg-[#1F2A43]" />
}

export function RegionSelectBottomSheet({
  visible,
  selectedRegions,
  regions = MOCK_REGIONS,
  onToggle,
  onClose,
  onConfirm,
}: Props) {
  // insets.bottom은 런타임에만 알 수 있는 동적 값 — style 사용 의도적 예외
  const insets = useScreenInsets()

  const renderItem = useCallback(
    ({ item }: { item: string }) => {
      const selected = selectedRegions.includes(item)
      const maxReached = selectedRegions.length >= 3 && !selected
      return (
        <Pressable
          hitSlop={8}
          onPress={() => !maxReached && onToggle(item)}
          disabled={maxReached}
          className="h-[52px] flex-row items-center justify-between px-5"
          accessibilityRole="checkbox"
          accessibilityState={{ checked: selected, disabled: maxReached }}
          accessibilityLabel={item}
        >
          <Text
            style={{
              fontFamily: selected ? 'Pretendard-SemiBold' : 'Pretendard-Medium',
              fontSize: 16,
              color: maxReached ? '#4A5169' : selected ? '#C6A75E' : '#F2F2F2',
            }}
          >
            {item}
          </Text>
          <CheckCircle selected={selected} />
        </Pressable>
      )
    },
    [selectedRegions, onToggle]
  )

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        {/* 딤 배경 */}
        <Pressable
          className="absolute inset-0 bg-black/60"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="닫기"
        />

        {/* 바텀 시트 */}
        <View className="rounded-t-3xl bg-[#0D1630]" style={{ maxHeight: '72%' }}>
          {/* 드래그 핸들 */}
          <View className="items-center pb-1 pt-3">
            <View className="h-1 w-10 rounded-full bg-[#4A5169]" />
          </View>

          {/* 헤더 */}
          <View className="h-14 flex-row items-center justify-between px-5">
            <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 18, color: '#F2F2F2' }}>
              지역 선택
            </Text>
            <View className="flex-row items-center gap-3">
              <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 13, color: '#A2A2A2' }}>
                {selectedRegions.length}/3
              </Text>
              <Pressable
                hitSlop={8}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="닫기"
              >
                <Text style={{ fontSize: 18, color: '#A2A2A2' }}>✕</Text>
              </Pressable>
            </View>
          </View>

          {/* 구분선 */}
          <View className="h-px bg-[#1F2A43]" />

          {/* 지역 목록 */}
          <FlatList
            data={regions}
            keyExtractor={(item) => item}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={Separator}
          />

          {/* 하단 버튼 */}
          <View
            className="border-t border-[#1F2A43] px-4 pt-3"
            style={{ paddingBottom: insets.bottom + 12 }}
          >
            <Pressable
              hitSlop={0}
              onPress={onConfirm}
              className="h-[50px] items-center justify-center rounded-xl bg-[#C6A75E]"
              accessibilityRole="button"
              accessibilityLabel="선택 완료"
            >
              <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 17, color: '#07091C' }}>
                선택 완료
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}
