import { FlatList, Pressable, View } from 'react-native'

import { Text } from '@/components/AppText'

export type ReviewSort = 'latest' | 'best'

type Props = {
  activeSort: ReviewSort
  onSortChange: (sort: ReviewSort) => void
  isDeleteMode: boolean
  // 생략 시 삭제요청 버튼 숨김 (고객이 보는 명인 리뷰)
  onDeleteModeToggle?: () => void
}

type TabItem = { key: ReviewSort; label: string }

const TABS: TabItem[] = [
  { key: 'latest', label: '최신순' },
  { key: 'best', label: '베스트순' },
]

export function ReviewFilterTabs({
  activeSort,
  onSortChange,
  isDeleteMode,
  onDeleteModeToggle,
}: Props) {
  return (
    <View className="flex-row items-center" style={{ height: 36 }}>
      <FlatList
        horizontal
        scrollEnabled={false}
        data={TABS}
        keyExtractor={(tab) => tab.key}
        renderItem={({ item: tab }) => {
          const isActive = activeSort === tab.key
          return (
            <View className="flex-row items-center">
              <Pressable
                hitSlop={8}
                onPress={() => onSortChange(tab.key)}
                className="flex-row items-center gap-1 px-1"
                style={{ height: 30, justifyContent: 'center' }}
              >
                <Text
                  className={`text-small2 ${isActive ? 'text-primary' : 'text-gray2'}`}
                  style={{ fontFamily: 'Pretendard-SemiBold' }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            </View>
          )
        }}
      />

      {/* Spacer */}
      <View className="flex-1" />

      {/* 삭제요청 버튼 */}
      {onDeleteModeToggle && (
      <Pressable
        hitSlop={8}
        onPress={onDeleteModeToggle}
        className="flex-row items-center gap-1 rounded bg-gray1 px-2"
        style={{ height: 24 }}
      >
        <Text className="text-gray2" style={{ fontSize: 9 }}>
          🗑
        </Text>
        <Text
          className={`text-small2 ${isDeleteMode ? 'text-primary' : 'text-gray2'}`}
          style={{ fontFamily: 'Pretendard-SemiBold' }}
        >
          삭제요청
        </Text>
      </Pressable>
      )}
    </View>
  )
}
