import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { FlatList, Platform, Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ArrowBackIcon, StarFillIcon, StarNoneIcon } from '@/assets/icons'
import { Text } from '@/components/AppText'
import { type WrittenReviewItem, useMyWrittenReviews } from '@/hooks/useMyWrittenReviews'
import { RootStackParamList } from '@/navigation/RootNavigator'

type NavProp = NativeStackNavigationProp<RootStackParamList>

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.11,
    shadowRadius: 2.9,
  },
  android: { elevation: 2 },
})

function StarRow({ rating }: { rating: number }) {
  return (
    <View className="flex-row gap-[2px]">
      {[1, 2, 3, 4, 5].map((n) =>
        n <= rating ? (
          <StarFillIcon key={n} size={14} />
        ) : (
          <StarNoneIcon key={n} size={14} />
        )
      )}
    </View>
  )
}

function ReviewCard({ item }: { item: WrittenReviewItem }) {
  const dateStr = new Date(item.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <View
      className="rounded-[4px] bg-[#F2F2F2] px-4 py-4"
      style={CARD_SHADOW}
    >
      <View className="flex-row items-center justify-between">
        <StarRow rating={item.rating} />
        <Text
          className="text-[11px] text-[#A2A2A2]"
          style={{ fontFamily: 'Pretendard-Medium' }}
        >
          {dateStr}
        </Text>
      </View>
      {item.content ? (
        <Text
          className="mt-2 text-[13px] text-[#1F2A43]"
          style={{ fontFamily: 'Pretendard-Medium', lineHeight: 20 }}
        >
          {item.content}
        </Text>
      ) : (
        <Text
          className="mt-2 text-[13px] text-[#A2A2A2]"
          style={{ fontFamily: 'Pretendard-Medium' }}
        >
          내용 없음
        </Text>
      )}
    </View>
  )
}

export function MyReviewsScreen() {
  const navigation = useNavigation<NavProp>()
  const insets = useSafeAreaInsets()
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useMyWrittenReviews()

  const reviews = data?.pages.flatMap((p) => p.data) ?? []

  return (
    <View className="flex-1 bg-[#F2F2F2]" style={{ paddingTop: insets.top }}>
      {/* 네비바 */}
      <View className="h-[60px] flex-row items-center px-4">
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
          onPress={() => navigation.goBack()}
        >
          <ArrowBackIcon />
        </Pressable>
        <Text
          className="ml-3 text-[20px] text-[#1F2A43]"
          style={{ fontFamily: 'Pretendard-ExtraBold' }}
        >
          내가 쓴 리뷰
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-[14px] text-[#74768E]" style={{ fontFamily: 'Pretendard-Medium' }}>
            불러오는 중...
          </Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage() }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <Text
                className="py-4 text-center text-[13px] text-[#A2A2A2]"
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                불러오는 중...
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20">
              <Text
                className="text-[14px] text-[#74768E]"
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                아직 작성한 리뷰가 없습니다
              </Text>
            </View>
          }
          renderItem={({ item }) => <ReviewCard item={item} />}
        />
      )}
    </View>
  )
}
