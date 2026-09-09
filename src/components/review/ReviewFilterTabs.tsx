import { Pressable, Text, View } from 'react-native'

import PhotoSvg from '@/assets/icons/photo.svg'

export type ReviewSort = 'latest' | 'best' | 'photo'

type Props = {
  activeSort: ReviewSort
  onSortChange: (sort: ReviewSort) => void
  isDeleteMode: boolean
  onDeleteModeToggle: () => void
}

type TabItem = { key: ReviewSort; label: string }

const TABS: TabItem[] = [
  { key: 'latest', label: '최신순' },
  { key: 'best', label: '베스트순' },
  { key: 'photo', label: '사진리뷰' },
]

export function ReviewFilterTabs({
  activeSort,
  onSortChange,
  isDeleteMode,
  onDeleteModeToggle,
}: Props) {
  return (
    <View
      className="flex-row items-center"
      style={{ height: 36 }}
    >
      {TABS.map((tab, index) => {
        const isActive = activeSort === tab.key
        return (
          <View key={tab.key} className="flex-row items-center">
            {/* Vertical divider (between tabs) */}
            {index > 0 && (
              <View className="bg-gray2 mx-2" style={{ width: 1, height: 10 }} />
            )}
            <Pressable
              hitSlop={8}
              onPress={() => onSortChange(tab.key)}
              className="flex-row items-center gap-1 px-1"
              style={{ height: 30, justifyContent: 'center' }}
            >
              {tab.key === 'photo' ? (
                <PhotoSvg width={14} height={14} />
              ) : null}
              <Text
                className={`text-small2 ${isActive ? 'text-primary' : 'text-gray2'}`}
                style={{ fontFamily: 'Pretendard-SemiBold' }}
              >
                {tab.label}
              </Text>
            </Pressable>
          </View>
        )
      })}

      {/* Spacer */}
      <View className="flex-1" />

      {/* 삭제요청 버튼 */}
      <Pressable
        hitSlop={8}
        onPress={onDeleteModeToggle}
        className="flex-row items-center gap-1 rounded bg-gray1 px-2"
        style={{ height: 24 }}
      >
        <Text className="text-gray2" style={{ fontSize: 9 }}>🗑</Text>
        <Text
          className={`text-small2 ${isDeleteMode ? 'text-primary' : 'text-gray2'}`}
          style={{ fontFamily: 'Pretendard-SemiBold' }}
        >
          삭제요청
        </Text>
      </Pressable>
    </View>
  )
}
