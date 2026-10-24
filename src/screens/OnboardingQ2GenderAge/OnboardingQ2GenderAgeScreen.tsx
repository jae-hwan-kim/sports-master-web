import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useState } from 'react'
import { Pressable, StatusBar, StyleSheet, View } from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'

import { ArrowBackIcon, SettingsIcon } from '@/assets/icons'
import { Text } from '@/components/AppText'
import { Chip } from '@/components/Chip'
import { useScreenInsets } from '@/hooks/useScreenInsets'
import { RootStackParamList } from '@/navigation/RootNavigator'
import { useOnboardingStore } from '@/store/onboardingStore'

type Gender = 'female' | 'male'
type AgeGroup = '10s' | '20s' | '30s' | '40s' | '50s' | '60s_plus'

const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: '여성', value: 'female' },
  { label: '남성', value: 'male' },
]

const AGE_OPTIONS: { label: string; value: AgeGroup }[] = [
  { label: '10대', value: '10s' },
  { label: '20대', value: '20s' },
  { label: '30대', value: '30s' },
  { label: '40대', value: '40s' },
  { label: '50대', value: '50s' },
  { label: '60대 이상', value: '60s_plus' },
]

// Figma: filled 224px / total 338px ≈ 66.27%
const PROGRESS_FILL_PCT = `${((224 / 338) * 100).toFixed(2)}%` as const

const s = StyleSheet.create({
  nextButtonShadow: {
    shadowColor: 'rgba(6,34,70,1)',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  nextButtonBg: {
    backgroundColor: 'rgba(16,51,111,0.41)',
  },
  nextButtonText: {
    color: 'rgba(242,242,242,0.85)',
    fontSize: 16,
  },
})

export function OnboardingQ2GenderAgeScreen() {
  // RootStackParamList에 OnboardingQ2GenderAge / Settings 미등록 상태 — 추가 후 any 제거 필요
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useScreenInsets()
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null)
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(null)
  const setGender = useOnboardingStore((s) => s.setGender)
  const setAgeGroup = useOnboardingStore((s) => s.setAgeGroup)

  const canProceed = selectedGender !== null && selectedAge !== null

  const handleNext = () => {
    if (!canProceed) return
    setGender(selectedGender!)
    setAgeGroup(selectedAge!)
    navigation.navigate('SurveyKeywordSelect')
  }

  const handleSettings = () => {
    navigation.navigate('CustomerSettings')
  }

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="light-content" backgroundColor="#07091C" />

      {/* Navigation Bar */}
      <View className="flex-row items-center justify-between px-[16px]">
        <Pressable
          hitSlop={8}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
        >
          <ArrowBackIcon size={44} />
        </Pressable>
        <Pressable
          hitSlop={8}
          onPress={handleSettings}
          accessibilityRole="button"
          accessibilityLabel="설정"
        >
          <SettingsIcon size={44} />
        </Pressable>
      </View>

      {/* Progress Bar — total track + filled overlay */}
      <View className="mx-[32px] mt-[8px] h-[2px] overflow-hidden bg-gray2">
        <View className="h-[2px] bg-primary" style={{ width: PROGRESS_FILL_PCT as `${number}%` }} />
      </View>

      {/* Top flex spacer — pushes content toward center */}
      <View className="grow" />

      {/* Q2 Label + Question Text */}
      <View className="items-center px-[16px]">
        <Text className="font-pretendard-medium text-primary" style={{ fontSize: 36 }}>
          Q2
        </Text>
        <Text
          className="mt-[8px] text-center font-pretendard-medium text-white"
          style={{ fontSize: 24, lineHeight: 36 }}
        >
          성별과 연령대를 알려주세요
        </Text>
      </View>

      {/* Gender Chips (단일 선택) */}
      <View className="mt-[28px] flex-row justify-start gap-[10px] pl-[56px]">
        {GENDER_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            variant="onboarding"
            selected={selectedGender === opt.value}
            onPress={() => setSelectedGender(opt.value)}
          />
        ))}
      </View>

      {/* Divider */}
      <View className="mx-[58px] mt-[14px] h-px bg-gray2" />

      {/* Age Chips (단일 선택, flex-wrap) */}
      <View className="ml-[56px] mr-[16px] mt-[10px] flex-row flex-wrap gap-[8px]">
        {AGE_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            variant="onboarding"
            selected={selectedAge === opt.value}
            onPress={() => setSelectedAge(opt.value)}
          />
        ))}
      </View>

      {/* Bottom flex spacer (2×) — content biased slightly toward upper-center */}
      <View style={{ flexGrow: 2 }} />

      {/* Gradient Overlay + Next Button */}
      <View className="h-[239px]">
        <LinearGradient
          colors={['transparent', '#1A4B8E', '#429EF4']}
          locations={[0, 0.68, 1.0]}
          style={StyleSheet.absoluteFill}
        />
        <View
          className="flex-1 justify-end px-[16px]"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <Pressable
            hitSlop={8}
            onPress={handleNext}
            disabled={!canProceed}
            accessibilityRole="button"
            accessibilityLabel="다음으로"
            accessibilityState={{ disabled: !canProceed }}
            className="h-[69px] items-center justify-center rounded-[16px]"
            style={[s.nextButtonShadow, s.nextButtonBg, { opacity: canProceed ? 1 : 0.5 }]}
          >
            <Text className="font-pretendard-regular" style={s.nextButtonText}>
              다음으로
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}
