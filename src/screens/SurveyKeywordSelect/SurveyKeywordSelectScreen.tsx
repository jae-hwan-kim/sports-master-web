import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useCallback, useState } from 'react'
import { Alert, Platform, Pressable, StatusBar, View } from 'react-native'
import Svg, { Defs, Rect, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg'

import { LinearGradient } from 'expo-linear-gradient'

import { ArrowBackIcon, SettingsIcon } from '@/assets/icons'
import { Text } from '@/components/AppText'
import { SurveyKeywordChip } from '@/components/SurveyKeywordChip'
import { useScreenInsets } from '@/hooks/useScreenInsets'
import { useUpdateCustomerProfile } from '@/hooks/useUpdateCustomerProfile'
import { RootStackParamList } from '@/navigation/RootNavigator'
import { useOnboardingStore } from '@/store/onboardingStore'

const KEYWORDS = [
  '컨디셔닝',
  '재활운동',
  '체형교정',
  '기능성운동',
  '선수트레이닝',
  '아동발달',
  '방문재활',
  '1:1 지도',
  '필라테스',
  '특수치료',
  '체형분석',
  '식단관리',
  '시니어운동',
  '수술재활',
  '원장직강',
]

const MAX_SELECTION = 3

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function SurveyKeywordSelectScreen() {
  const navigation = useNavigation<NavigationProp>()
  const insets = useScreenInsets()
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])

  const selectedRegions = useOnboardingStore((s) => s.selectedRegions)
  const gender = useOnboardingStore((s) => s.gender)
  const ageGroup = useOnboardingStore((s) => s.ageGroup)
  const clearOnboarding = useOnboardingStore((s) => s.clearOnboarding)

  // PATCH /customer-profiles/me — 온보딩 전체 데이터 저장
  const { mutate, isPending } = useUpdateCustomerProfile()

  const handleChipPress = useCallback((keyword: string) => {
    setSelectedKeywords((prev) => {
      if (prev.includes(keyword)) return prev.filter((k) => k !== keyword)
      if (prev.length >= MAX_SELECTION) return prev
      return [...prev, keyword]
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (selectedKeywords.length === 0) return

    mutate(
      {
        region: selectedRegions.join(','),
        gender: gender ?? undefined,
        ageGroup: ageGroup ?? undefined,
        keywords: selectedKeywords,
      },
      {
        onSuccess: () => {
          clearOnboarding()
          navigation.navigate('RecommendedMasters')
        },
        onError: (error: unknown) => {
          const message =
            error instanceof Error ? error.message : '저장에 실패했습니다. 다시 시도해주세요.'
          Alert.alert('오류', message)
        },
      }
    )
  }, [selectedKeywords, selectedRegions, gender, ageGroup, mutate, clearOnboarding, navigation])

  const isDisabled = selectedKeywords.length === 0 || isPending

  return (
    <View className="flex-1 bg-[#07091C]">
      <StatusBar barStyle="light-content" />

      {/* Navigation Bar */}
      <View
        className="h-14 flex-row items-center justify-between px-4"
        style={{ marginTop: insets.top }}
      >
        <Pressable
          className="h-11 w-11 items-center justify-center"
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
        >
          <ArrowBackIcon />
        </Pressable>
        <Pressable
          className="h-11 w-11 items-center justify-center"
          onPress={() => Alert.alert('준비 중', '설정 기능을 준비 중입니다.')}
          accessibilityRole="button"
          accessibilityLabel="설정"
        >
          <SettingsIcon />
        </Pressable>
      </View>

      {/* Decorative Line */}
      <View className="items-center pt-[13px]">
        <DecorativeLine />
      </View>

      {/* Step Label */}
      <Text className="mt-6 text-center font-pretendard-medium text-[36px] leading-[36px] text-primary">
        Q3
      </Text>

      {/* Title */}
      <Text className="mt-3 px-7 text-center font-pretendard-medium text-[24px] leading-[36px] text-[#F2F2F2]">
        연관 키워드를 선택해주세요
      </Text>

      {/* Subtitle */}
      <Text className="mt-1 text-center font-pretendard-medium text-[17px] text-[#A2A2A2]">
        (최대 3개 선택가능)
      </Text>

      {/* Chip Group — flex-1 centers group vertically in remaining space */}
      <View className="flex-1 justify-center">
        {/* gap-x-2(8px)/gap-y-[34px] require NativeWind v4 rowGap/columnGap support */}
        <View className="flex-row flex-wrap gap-x-2 gap-y-2 px-7">
          {/* static keyword list — FlatList excluded: flex-wrap layout, 15 static items */}
          {KEYWORDS.map((keyword) => (
            <SurveyKeywordChip
              key={keyword}
              label={keyword}
              selected={selectedKeywords.includes(keyword)}
              onPress={() => handleChipPress(keyword)}
            />
          ))}
        </View>
      </View>

      {/* Bottom Gradient Overlay (non-interactive) */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,19,75,0)', '#1A4B8E', '#429EF4']}
        locations={[0, 0.688, 1]}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 239 }}
      />

      {/* Confirm Button */}
      <Pressable
        disabled={isDisabled}
        onPress={handleConfirm}
        accessibilityRole="button"
        accessibilityLabel="선택완료"
        accessibilityState={{ disabled: isDisabled }}
        className={`mx-4 h-[69px] items-center justify-center rounded-2xl ${
          isDisabled ? 'bg-[#10336F]/20' : 'bg-[#10336F]/41'
        }`}
        style={[
          { marginBottom: Math.max(insets.bottom, 24) },
          Platform.select({
            ios: {
              shadowColor: '#062246',
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
            },
            android: { elevation: 4 },
          }),
        ]}
      >
        <Text
          className={`font-pretendard-regular text-[16px] ${isDisabled ? 'text-white/40' : 'text-[#F2F2F2]/85'}`}
        >
          {isPending ? '저장 중...' : '선택완료'}
        </Text>
      </Pressable>
    </View>
  )
}

function DecorativeLine() {
  return (
    <Svg width={338} height={6} accessibilityElementsHidden>
      <Defs>
        <SvgLinearGradient
          id="lineGrad"
          x1="0"
          y1="0"
          x2="338"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#C6A75E" stopOpacity={0} />
          <Stop offset="0.5" stopColor="#C6A75E" stopOpacity={1} />
          <Stop offset="1" stopColor="#C6A75E" stopOpacity={0} />
        </SvgLinearGradient>
        <SvgLinearGradient
          id="highlightGrad"
          x1="0"
          y1="0"
          x2="338"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.2" stopColor="#F5D98E" stopOpacity={0} />
          <Stop offset="0.5" stopColor="#F5D98E" stopOpacity={0.6} />
          <Stop offset="0.8" stopColor="#F5D98E" stopOpacity={0} />
        </SvgLinearGradient>
      </Defs>
      {/* Vector142: gold base line */}
      <Rect x={0} y={3} width={338} height={2} fill="url(#lineGrad)" />
      {/* Vector143: lighter highlight overlay */}
      <Rect x={0} y={2} width={338} height={2} fill="url(#highlightGrad)" />
    </Svg>
  )
}
