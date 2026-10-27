import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useCallback } from 'react'
import { FlatList, Pressable, View } from 'react-native'

import { Text } from '@/components/AppText'
import { EmptyState } from '@/components/EmptyState'
import { PanelScreen } from '@/components/PanelScreen'
import { ExpertAvatar, REVIEW_CARD_SHADOW } from '@/components/review/ReviewForm'
import { type WrittenReviewItem, useMyWrittenReviews } from '@/hooks/useMyWrittenReviews'
import { useScreenInsets } from '@/hooks/useScreenInsets'
import { RootStackParamList } from '@/navigation/RootNavigator'

type NavProp = NativeStackNavigationProp<RootStackParamList>

// Figma 내가 작성한 리뷰: 명인 사진 + 닉네임 + 내가 쓴 후기(1줄) — 탭하면 리뷰 확인 화면
function ReviewCard({ item }: { item: WrittenReviewItem }) {
  const navigation = useNavigation<NavProp>()

  const handlePress = () => {
    navigation.navigate('MyReviewEdit', {
      reviewId: item.id,
      expertName: item.expertName,
      expertAvatarUrl: item.expertAvatarUrl,
      initialRating: item.rating,
      initialContent: item.content ?? '',
    })
  }

  return (
    <Pressable
      hitSlop={8}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${item.expertName ?? ''} 리뷰 확인`}
      className="h-[82px] flex-row items-center rounded-[8px] bg-white px-4"
      style={REVIEW_CARD_SHADOW}
    >
      <ExpertAvatar uri={item.expertAvatarUrl} size={50} />
      <View className="ml-4 flex-1 justify-center gap-3">
        <Text className="font-pretendard-medium text-[12px] text-secondary" numberOfLines={1}>
          {item.expertName}
        </Text>
        {!!item.content && (
          <Text className="font-pretendard-medium text-[12px] text-gray2" numberOfLines={1}>
            {item.content}
          </Text>
        )}
      </View>
    </Pressable>
  )
}

export function MyReviewsScreen() {
  const insets = useScreenInsets()
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMyWrittenReviews()

  const reviews = data?.pages.flatMap((p) => p.data) ?? []

  const renderItem = useCallback(
    ({ item }: { item: WrittenReviewItem }) => <ReviewCard item={item} />,
    []
  )

  return (
    <PanelScreen title="내가 작성한 리뷰" subtitle="내가 쓴 리뷰를 수정하고 삭제할 수 있습니다">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-[14px] text-[#74768E]" style={{ fontFamily: 'Pretendard-Medium' }}>
            불러오는 중...
          </Text>
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-[14px] text-[#74768E]" style={{ fontFamily: 'Pretendard-Medium' }}>
            목록을 불러올 수 없습니다
          </Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            paddingHorizontal: 32,
            paddingTop: 28,
            paddingBottom: insets.bottom + 24,
            flexGrow: 1,
          }}
          ItemSeparatorComponent={() => <View className="h-4" />}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage()
          }}
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
          ListEmptyComponent={<EmptyState title="내가 작성한 리뷰가 없습니다" />}
          renderItem={renderItem}
        />
      )}
    </PanelScreen>
  )
}
