import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useState } from 'react'
import { View } from 'react-native'

import { Chip } from '@/components/Chip'
import {
  SURVEY_PROGRESS,
  SurveyButton,
  SurveyLayout,
  SurveyQuestion,
} from '@/components/onboarding/SurveyLayout'
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

export function OnboardingQ2GenderAgeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
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
    <SurveyLayout
      onBack={() => navigation.goBack()}
      onSettings={handleSettings}
      progress={SURVEY_PROGRESS.q2}
      footer={<SurveyButton label="다음으로" onPress={handleNext} disabled={!canProceed} />}
    >
      <SurveyQuestion step="Q2" title="성별과 연령대를 알려주세요">
        {/* 성별 (단일 선택) */}
        <View className="flex-row gap-2 px-[56px]">
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

        <View className="mx-[58px] mt-3 h-px bg-gray3" />

        {/* 연령대 (단일 선택) */}
        <View className="mt-3 flex-row flex-wrap gap-2 px-[56px]">
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
      </SurveyQuestion>
    </SurveyLayout>
  )
}
