import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useCallback } from 'react'
import { FlatList, Platform, Pressable, View } from 'react-native'

import { Image } from 'expo-image'

import { ProfilePersonIcon, StarFillIcon } from '@/assets/icons'
import { Text } from '@/components/AppText'
import { EmptyState } from '@/components/EmptyState'
import { PanelScreen } from '@/components/PanelScreen'
import { type FavoriteExpertItem, useFavoriteExperts } from '@/hooks/useFavoriteExperts'
import { useScreenInsets } from '@/hooks/useScreenInsets'
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

function ExpertRow({ item, onPress }: { item: FavoriteExpertItem; onPress: () => void }) {
  return (
    <Pressable
      hitSlop={8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.name} 명인 상세보기`}
      className="flex-row items-center rounded-[4px] bg-[#F2F2F2] px-4"
      style={{ height: 72, ...CARD_SHADOW }}
    >
      {/* 아바타 */}
      <View className="h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-full bg-[#C6A75E]">
        {item.avatarUrl ? (
          <Image
            source={{ uri: item.avatarUrl }}
            style={{ width: 48, height: 48 }}
            contentFit="cover"
          />
        ) : (
          <ProfilePersonIcon size={28} />
        )}
      </View>

      {/* 정보 */}
      <View className="ml-3 flex-1">
        <Text className="text-[15px] text-[#1F2A43]" style={{ fontFamily: 'Pretendard-SemiBold' }}>
          {item.name}
        </Text>
        <View className="mt-1 flex-row items-center gap-1">
          <StarFillIcon size={12} />
          <Text className="text-[12px] text-[#74768E]" style={{ fontFamily: 'Pretendard-Medium' }}>
            {item.avgRating.toFixed(1)} · 리뷰 {item.reviewCount}개
          </Text>
        </View>
      </View>

      {/* 등급 */}
      {item.grade && (
        <View className="h-[20px] items-center justify-center rounded-full bg-[#1F2A43] px-3">
          <Text className="text-[10px] text-[#C6A75E]" style={{ fontFamily: 'Pretendard-Medium' }}>
            {item.grade}
          </Text>
        </View>
      )}
    </Pressable>
  )
}

export function FavoriteExpertsScreen() {
  const navigation = useNavigation<NavProp>()
  const insets = useScreenInsets()
  const { data: experts, isLoading, isError } = useFavoriteExperts()

  const renderItem = useCallback(
    ({ item }: { item: FavoriteExpertItem }) => (
      <ExpertRow
        item={item}
        onPress={() => navigation.navigate('CustomerMasterDetail', { expertProfileId: item.id })}
      />
    ),
    [navigation]
  )

  return (
    <PanelScreen title="저장한 명인" subtitle="마음에 드는 명인을 모아볼 수 있습니다">
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
          data={experts ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            paddingHorizontal: 32,
            paddingTop: 28,
            paddingBottom: insets.bottom + 24,
            flexGrow: 1,
          }}
          ItemSeparatorComponent={() => <View className="h-2" />}
          ListEmptyComponent={<EmptyState title="아직 저장한 명인이 없습니다" />}
          renderItem={renderItem}
        />
      )}
    </PanelScreen>
  )
}
