import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useCallback, useState } from 'react'
import { Pressable } from 'react-native'
import Svg, { Path } from 'react-native-svg'

import { Text } from '@/components/AppText'
import {
  SURVEY_PROGRESS,
  SurveyButton,
  SurveyLayout,
  SurveyQuestion,
} from '@/components/onboarding/SurveyLayout'
import { RegionSelector } from '@/components/profile/RegionSelector'
import { RootStackParamList } from '@/navigation/RootNavigator'
import { useOnboardingStore } from '@/store/onboardingStore'

// RegionSelector 값 형식: "서울 > 강서구, 경기" — 명인 region과 같은 형식이라 추천 매칭에 그대로 사용
const REGION_SEPARATOR = ', '

// 드롭다운 내 아래 방향 chevron
function ChevronIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9l6 6 6-6"
        stroke="#D9D9D9"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export function RegionSelectQ1Screen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  // 온보딩 store에서 초기값 읽기 (뒤로 갔다 돌아왔을 때 복원)
  const storedRegions = useOnboardingStore((s) => s.selectedRegions)
  const setSelectedRegionsInStore = useOnboardingStore((s) => s.setSelectedRegions)
  const [region, setRegion] = useState(storedRegions.join(REGION_SEPARATOR))

  const canProceed = region.length > 0

  const handleNext = useCallback(() => {
    if (!canProceed) return
    // 온보딩 store에 저장 — 이후 Q 화면 및 최종 제출 시 사용
    setSelectedRegionsInStore(region.split(REGION_SEPARATOR))
    navigation.navigate('OnboardingQ2GenderAge')
  }, [canProceed, region, setSelectedRegionsInStore, navigation])

  return (
    <SurveyLayout
      onBack={() => navigation.goBack()}
      onSettings={() => navigation.navigate('CustomerSettings')}
      progress={SURVEY_PROGRESS.q1}
      footer={<SurveyButton label="다음으로" onPress={handleNext} disabled={!canProceed} />}
    >
      <SurveyQuestion
        step="Q1"
        title="어떤 지역의 명인을 찾으시나요?"
        subtitle="(최대 3개 선택가능)"
      >
        {/* Figma: 드롭다운 y=484 (본문 시작 451 + 33) — 지역선택 시트는 명인 상세페이지_Full_지역선택과 동일 */}
        <RegionSelector
          value={region}
          onChange={setRegion}
          renderTrigger={(open) => (
            <Pressable
              hitSlop={8}
              onPress={open}
              className="ml-8 mr-[21px] mt-[33px] h-[46px] flex-row items-center justify-between rounded-[4px] border border-gray3 bg-[#030F23] pl-[13px] pr-3"
              accessibilityRole="button"
              accessibilityLabel={region ? `선택된 지역: ${region}` : '지역 선택하기'}
            >
              <Text
                numberOfLines={1}
                className={`mr-2 flex-1 font-pretendard-medium text-[12px] ${
                  region ? 'text-white' : 'text-gray1'
                }`}
              >
                {region || '원하는 지역 선택하기'}
              </Text>
              <ChevronIcon />
            </Pressable>
          )}
        />
      </SurveyQuestion>
    </SurveyLayout>
  )
}
