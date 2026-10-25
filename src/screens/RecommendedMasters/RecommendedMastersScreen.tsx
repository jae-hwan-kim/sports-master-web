import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useCallback, useState } from 'react'
import { FlatList, Platform, Pressable, View } from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'

import { Text } from '@/components/AppText'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { MasterCard, type MasterItem } from '@/components/MasterCard'
import { useRecommendedMasters } from '@/hooks/useRecommendedMasters'
import { useScreenInsets } from '@/hooks/useScreenInsets'
import { RootStackParamList } from '@/navigation/RootNavigator'

type NavProp = NativeStackNavigationProp<RootStackParamList>

// ---------------------------------------------------------------------------
// Skeleton card — shown while API is loading
// ---------------------------------------------------------------------------
function SkeletonCard() {
  return (
    <View>
      <View className="h-[289] w-full rounded-[12] bg-[#1F2A43]" />
      <View className="ml-12 mt-3 h-[18] w-[120] rounded-[4] bg-[#1F2A43]" />
      <View className="ml-12 mt-2 h-[14] w-[180] rounded-[4] bg-[#1F2A43]" />
      <View className="ml-12 mt-2 h-[28] w-[120] rounded-[4] bg-[#1F2A43]" />
    </View>
  )
}

const SKELETON_KEYS = ['sk1', 'sk2', 'sk3'] as const

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
const HEADER_HEIGHT = 93

export function RecommendedMastersScreen() {
  const navigation = useNavigation<NavProp>()
  const insets = useScreenInsets()
  // Figma 2321:8871 종료팝업 — 확인 시 설문 화면들을 닫고 고객홈으로
  const [exitVisible, setExitVisible] = useState(false)

  const { data: recommendation, isLoading, isError } = useRecommendedMasters()

  const masters: MasterItem[] = (recommendation?.recommendedExperts ?? []).map((ep) => ({
    id: ep.id,
    name: ep.name,
    profileImage: ep.avatarUrl ?? '',
    intro: ep.representativeService,
    location: ep.region,
    specialties: ep.keywordTags ?? [],
    isMaster: ep.expertGrade !== null,
  }))

  const scrollPaddingTop = insets.top + HEADER_HEIGHT + 24

  const renderCard = useCallback(
    ({ item }: { item: MasterItem }) => (
      <MasterCard
        item={item}
        onDetail={() => navigation.navigate('CustomerMasterDetail', { expertProfileId: item.id })}
      />
    ),
    [navigation]
  )

  const keyExtractor = useCallback((item: MasterItem) => String(item.id), [])

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <View className="flex-1 bg-[#07091C]">
        <StatusBar style="light" />
        <View
          className="absolute left-0 right-0 top-0 z-10 bg-[#07091C]"
          style={{ height: insets.top + HEADER_HEIGHT, paddingTop: insets.top }}
        >
          <View className="flex-1 items-center justify-center px-8">
            <Text
              className="text-center text-[24px] text-[#F2F2F2]"
              style={{ fontFamily: 'Pretendard-Medium', lineHeight: 36 }}
            >
              가장 적합한 명인 3인을 찾았습니다!
            </Text>
          </View>
        </View>
        <FlatList
          data={SKELETON_KEYS}
          keyExtractor={(k) => k}
          renderItem={() => <SkeletonCard />}
          contentContainerStyle={{
            paddingTop: scrollPaddingTop,
            paddingBottom: 120,
            paddingHorizontal: 32,
            gap: 16,
          }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    )
  }

  // ---------------------------------------------------------------------------
  // Error / empty
  // ---------------------------------------------------------------------------
  if (isError || masters.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-[#07091C]">
        <StatusBar style="light" />
        <Text className="text-[14px] text-[#F2F2F2]" style={{ fontFamily: 'Pretendard-Medium' }}>
          추천 명인을 불러올 수 없습니다.
        </Text>
        <Pressable
          hitSlop={8}
          onPress={() => navigation.goBack()}
          className="mt-4 h-[44] items-center justify-center rounded-[8] bg-[#4285F4] px-6"
        >
          <Text className="text-[14px] text-[#F2F2F2]" style={{ fontFamily: 'Pretendard-Medium' }}>
            돌아가기
          </Text>
        </Pressable>
      </View>
    )
  }

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------
  return (
    <View className="flex-1 bg-[#07091C]">
      <StatusBar style="light" />

      {/* Header — absolute overlay, bg matches screen */}
      <View
        className="absolute left-0 right-0 top-0 z-10 bg-[#07091C]"
        style={{ height: insets.top + HEADER_HEIGHT, paddingTop: insets.top }}
      >
        <View className="flex-1 items-center justify-center px-8">
          <Text
            className="text-center text-[24px] text-[#F2F2F2]"
            style={{ fontFamily: 'Pretendard-Medium', lineHeight: 36 }}
          >
            가장 적합한 명인 3인을 찾았습니다!
          </Text>
        </View>
      </View>

      {/* Master card list */}
      <FlatList
        data={masters}
        keyExtractor={keyExtractor}
        renderItem={renderCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: scrollPaddingTop,
          paddingBottom: 120,
          paddingHorizontal: 32,
          gap: 16,
        }}
      />

      {/* Screen bottom gradient decoration */}
      <LinearGradient
        colors={['rgba(0,19,75,0)', '#1A4B8E', '#429EF4']}
        locations={[0, 0.688, 1.0]}
        className="absolute bottom-0 left-0 right-0 h-[239]"
        pointerEvents="none"
      />

      {/* EndButton — bottom-anchored for reliable cross-device positioning */}
      <View
        className="absolute left-0 right-0 z-20 items-center"
        style={{ bottom: insets.bottom + 100 }}
      >
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="종료하기"
          onPress={() => setExitVisible(true)}
          className="h-[69] w-[370] items-center justify-center rounded-[16] bg-[rgba(16,51,111,0.41)]"
          style={Platform.select({
            ios: {
              shadowColor: '#062246',
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
            },
            android: {
              elevation: 6,
            },
          })}
        >
          <Text
            className="text-center text-[16px] text-[#F2F2F2]"
            style={{ fontFamily: 'Pretendard-Regular', opacity: 0.85 }}
          >
            종료하기
          </Text>
        </Pressable>
      </View>

      <ConfirmDialog
        visible={exitVisible}
        title="탐색을 종료합니다"
        description="언제든 다시 탐색이 가능합니다"
        onConfirm={() => {
          setExitVisible(false)
          // 모드 토글 후엔 홈 루트 이름이 'MasterHome'일 수 있음 — 스택 루트가 홈이면 그대로 복귀
          const rootName = navigation.getState().routes[0]?.name
          if (rootName === 'MasterHome' || rootName === 'CustomerHome') navigation.popToTop()
          else navigation.reset({ index: 0, routes: [{ name: 'CustomerHome' }] })
        }}
      />
    </View>
  )
}
