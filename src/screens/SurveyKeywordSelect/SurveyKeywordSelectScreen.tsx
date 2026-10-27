import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useCallback, useState } from 'react'
import { View } from 'react-native'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { SurveyKeywordChip } from '@/components/SurveyKeywordChip'
import {
  SURVEY_PROGRESS,
  SurveyButton,
  SurveyLayout,
  SurveyQuestion,
} from '@/components/onboarding/SurveyLayout'
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
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [saveFailed, setSaveFailed] = useState(false)

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
        region: selectedRegions.join(', '),
        gender: gender ?? undefined,
        ageGroup: ageGroup ?? undefined,
        keywords: selectedKeywords,
      },
      {
        onSuccess: () => {
          clearOnboarding()
          navigation.navigate('RecommendedMasters')
        },
        onError: () => setSaveFailed(true),
      }
    )
  }, [selectedKeywords, selectedRegions, gender, ageGroup, mutate, clearOnboarding, navigation])

  const isDisabled = selectedKeywords.length === 0 || isPending

  return (
    <SurveyLayout
      onBack={() => navigation.goBack()}
      onSettings={() => navigation.navigate('CustomerSettings')}
      progress={SURVEY_PROGRESS.q3}
      footer={
        <SurveyButton
          label={isPending ? '저장 중...' : '선택완료'}
          onPress={handleConfirm}
          disabled={isDisabled}
        />
      }
    >
      <SurveyQuestion step="Q3" title="연관 키워드를 선택해주세요" subtitle="(최대 3개 선택가능)">
        {/* static keyword list — flex-wrap 레이아웃이라 FlatList 대신 map */}
        <View className="flex-row flex-wrap gap-2 px-7">
          {KEYWORDS.map((keyword) => (
            <SurveyKeywordChip
              key={keyword}
              label={keyword}
              selected={selectedKeywords.includes(keyword)}
              onPress={() => handleChipPress(keyword)}
            />
          ))}
        </View>
      </SurveyQuestion>

      <ConfirmDialog
        visible={saveFailed}
        title="저장에 실패했습니다"
        description="잠시 후 다시 시도해 주세요"
        isError
        onConfirm={() => setSaveFailed(false)}
      />
    </SurveyLayout>
  )
}
