import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useState } from 'react'
import { Pressable, View } from 'react-native'
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg'

import { Text } from '@/components/AppText'
import { SURVEY_PROGRESS, SurveyButton, SurveyLayout } from '@/components/onboarding/SurveyLayout'
import { useCustomerProfile } from '@/hooks/useCustomerProfile'
import { RootStackParamList } from '@/navigation/RootNavigator'

// Figma: 명인빠른추천 — 원형 글로우(#37BCFF 40% radial, blur) + 중앙 다크 원
// TODO: 중앙 이미지(Figma 'image 6', 91x93) 에셋 내보내기 후 원 안에 배치
function GlowOrb() {
  return (
    <View className="h-[155px] w-[240px] items-center justify-center">
      <Svg width={240} height={155} style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor="#37BCFF" stopOpacity={0.4} />
            <Stop offset="1" stopColor="#006CBE" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={120} cy={77.5} rx={120} ry={77.5} fill="url(#glow)" />
      </Svg>
      <View className="h-[85px] w-[85px] rounded-full bg-black" />
    </View>
  )
}

export function MasterQuickRecommendScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { data: profile } = useCustomerProfile()
  // 명인빠른추천(인사) → 화면 터치 → 진행여부 파악
  const [step, setStep] = useState<'greeting' | 'confirm'>('greeting')

  const displayName = profile?.nickname || profile?.name || ''

  if (step === 'greeting') {
    return (
      <SurveyLayout
        onBack={() => navigation.goBack()}
        footer={
          <SurveyButton label="터치하면 대화가 시작됩니다" onPress={() => setStep('confirm')} />
        }
      >
        <Pressable
          className="flex-1"
          onPress={() => setStep('confirm')}
          accessibilityRole="button"
          accessibilityLabel="대화 시작"
        >
          {/* Figma: 글로우 y=250, 인사 y=435, 제목 y=472 */}
          <View className="mt-[125px] items-center">
            <GlowOrb />
            <Text className="mt-[30px] text-center font-pretendard-regular text-[16px] text-gray2">
              {displayName ? `안녕하세요 ${displayName} 님` : '안녕하세요'}
            </Text>
            <Text className="mt-[18px] text-center font-pretendard-semibold text-[28px] leading-[36px] text-[#FFFFFF]">
              {'오늘은 어떤 명인을\n찾아볼까요?'}
            </Text>
          </View>
        </Pressable>
      </SurveyLayout>
    )
  }

  return (
    <SurveyLayout
      onBack={() => setStep('greeting')}
      progress={SURVEY_PROGRESS.intro}
      footer={
        <>
          <SurveyButton
            label="계속진행"
            variant="secondary"
            onPress={() => navigation.navigate('RegionSelectQ1')}
          />
          <SurveyButton label="대화종료" onPress={() => navigation.goBack()} />
        </>
      }
    >
      {/* Figma: 안내 문구 y=323 */}
      <Text className="mt-[198px] px-8 text-center font-pretendard-medium text-[24px] leading-[36px] text-white">
        {'3가지 질문을 통해\n가장 적합한 명인을 찾아드립니다\n\n계속 진행하시겠습니까?'}
      </Text>
    </SurveyLayout>
  )
}
