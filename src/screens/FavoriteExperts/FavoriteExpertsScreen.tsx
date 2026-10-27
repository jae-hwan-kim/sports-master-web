import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useCallback } from 'react'
import { FlatList, Platform, Pressable, View } from 'react-native'

import { Image } from 'expo-image'

import { ProfilePersonIcon, StarFillIcon } from '@/assets/icons'
import { Text } from '@/components/AppText'
import { EmptyState } from '@/components/EmptyState'
import { PanelScreen } from '@/components/PanelScreen'
import {
  type FavoriteExpertItem,
  useFavoriteExperts,
  useRemoveFavoriteExpert,
} from '@/hooks/useFavoriteExperts'
import { useScreenInsets } from '@/hooks/useScreenInsets'
import { RootStackParamList } from '@/navigation/RootNavigator'

type NavProp = NativeStackNavigationProp<RootStackParamList>

// 명인탐색 카드 상단과 동일한 스타일 (#F2F2F2, shadow #8B8B8B 15%)
const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#8B8B8B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  android: { elevation: 3 },
})

function ExpertRow({
  item,
  onPress,
  onUnfavorite,
}: {
  item: FavoriteExpertItem
  onPress: () => void
  onUnfavorite: () => void
}) {
  return (
    <Pressable
      hitSlop={8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.name} 명인 상세보기`}
      className="h-[82px] flex-row items-center rounded-lg bg-white pl-4"
      style={CARD_SHADOW}
    >
      {/* 아바타 */}
      <View className="h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-full bg-[#C6A75E]">
        {item.avatarUrl ? (
          <Image
            source={{ uri: item.avatarUrl }}
            style={{ width: 50, height: 50 }}
            contentFit="cover"
          />
        ) : (
          <ProfilePersonIcon size={28} />
        )}
      </View>

      {/* 닉네임 + 소개글 (없으면 비움) */}
      <View className="ml-5 flex-1 justify-center gap-3">
        <Text className="font-pretendard-semibold text-[14px] text-secondary" numberOfLines={1}>
          {item.name}
        </Text>
        {!!item.introduction && (
          <Text className="font-pretendard-medium text-small2 text-gray3" numberOfLines={1}>
            {item.introduction}
          </Text>
        )}
      </View>

      {/* 저장 해제 */}
      <Pressable
        hitSlop={8}
        onPress={onUnfavorite}
        accessibilityRole="button"
        accessibilityLabel={`${item.name} 저장 해제`}
        className="h-[44px] w-[44px] items-center justify-center"
      >
        <StarFillIcon size={44} />
      </Pressable>
    </Pressable>
  )
}

export function FavoriteExpertsScreen() {
  const navigation = useNavigation<NavProp>()
  const insets = useScreenInsets()
  const { data: experts, isLoading, isError } = useFavoriteExperts()
  const { mutate: removeFavorite } = useRemoveFavoriteExpert()

  const renderItem = useCallback(
    ({ item }: { item: FavoriteExpertItem }) => (
      <ExpertRow
        item={item}
        onPress={() => navigation.navigate('CustomerMasterDetail', { expertProfileId: item.id })}
        onUnfavorite={() => removeFavorite(item.id)}
      />
    ),
    [navigation, removeFavorite]
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
          ItemSeparatorComponent={() => <View className="h-4" />}
          ListEmptyComponent={<EmptyState title="아직 저장한 명인이 없습니다" />}
          renderItem={renderItem}
        />
      )}
    </PanelScreen>
  )
}
