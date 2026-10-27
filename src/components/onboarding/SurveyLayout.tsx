import { Platform, Pressable, StatusBar, View } from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'

import { ArrowBackIcon, SettingsIcon } from '@/assets/icons'
import { Text } from '@/components/AppText'
import { useScreenInsets } from '@/hooks/useScreenInsets'

// Figma 진행바 전체 폭 338 — 단계별 채움 폭 (진행여부 40 / Q1 109 / Q2 224 / Q3 338)
export const SURVEY_PROGRESS = { intro: 40, q1: 109, q2: 224, q3: 338 } as const
const PROGRESS_TOTAL = 338

const BUTTON_SHADOW = Platform.select({
  ios: {
    shadowColor: '#062246',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  // Android elevation은 반투명 배경 아래로 비쳐 어두운 사각형이 생김 → 미적용
  android: {},
})

type LayoutProps = {
  onBack: () => void
  onSettings?: () => void
  // 진행바 채움 폭(px, 338 기준) — 생략 시 진행바 숨김
  progress?: number
  // 하단 고정 버튼 영역
  footer: React.ReactNode
  children: React.ReactNode
}

// 맞춤 명인탐색(명인빠른추천 ~ Q3) 공통 레이아웃 — 네비게이션/진행바/하단 그라디언트·버튼 위치를 고정
export function SurveyLayout({ onBack, onSettings, progress, footer, children }: LayoutProps) {
  const insets = useScreenInsets()

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="light-content" />

      <View className="h-14 flex-row items-center justify-between px-4">
        <Pressable
          hitSlop={8}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
        >
          <ArrowBackIcon color="#F2F2F2" />
        </Pressable>
        {onSettings && (
          <Pressable
            hitSlop={8}
            onPress={onSettings}
            accessibilityRole="button"
            accessibilityLabel="설정"
          >
            <SettingsIcon />
          </Pressable>
        )}
      </View>

      {/* Figma: 진행바 y=123 (stroke 4) — 트랙 #1F2A43, 채움 #B48247. 없는 화면도 높이 유지 */}
      <View
        className={`mx-8 mt-[11px] h-[4px] rounded-full ${progress !== undefined ? 'bg-gray3' : ''}`}
      >
        {progress !== undefined && (
          <View
            className="h-[4px] rounded-full bg-secondary"
            style={{ width: `${(progress / PROGRESS_TOTAL) * 100}%` }}
          />
        )}
      </View>

      <View className="flex-1">{children}</View>

      {/* 하단 그라디언트 — Figma: #00134B 0% → #1A4B8E 65% → #429EF4, h:239 */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,19,75,0)', '#1A4B8E', '#429EF4']}
        locations={[0, 0.65, 1]}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 239 }}
      />

      <View className="gap-3 px-[14px]" style={{ paddingBottom: insets.bottom + 31 }}>
        {footer}
      </View>
    </View>
  )
}

type ButtonProps = {
  label: string
  onPress: () => void
  disabled?: boolean
  // Figma: 기본(#10336F 41%) / 보조(#030F23 32%)
  variant?: 'primary' | 'secondary'
}

export function SurveyButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      className={`h-[69px] items-center justify-center rounded-2xl ${
        variant === 'primary' ? 'bg-[rgba(16,51,111,0.41)]' : 'bg-[rgba(3,15,35,0.32)]'
      } ${disabled ? 'opacity-50' : 'opacity-100'}`}
      style={BUTTON_SHADOW}
    >
      <Text className="font-pretendard-regular text-[16px] text-white">{label}</Text>
    </Pressable>
  )
}

type QuestionProps = {
  step: string
  title: string
  subtitle?: string
  children: React.ReactNode
}

// Q1~Q3 질문 블록 — Figma 기준 Q 라벨 y=311, 제목 y=359, 부제 y=395, 본문 y=451 고정
// (부제 없는 화면도 높이를 비워 두어 본문 시작 위치를 맞춤)
export function SurveyQuestion({ step, title, subtitle, children }: QuestionProps) {
  return (
    <View className="mt-[186px]">
      <Text className="text-center font-pretendard-medium text-[36px] leading-[36px] text-primary">
        {step}
      </Text>
      <Text className="mt-3 px-6 text-center font-pretendard-medium text-[24px] leading-[36px] text-white">
        {title}
      </Text>
      <Text className="h-[20px] text-center font-pretendard-medium text-[17px] text-[#A2A2A2]">
        {subtitle ?? ''}
      </Text>
      <View className="mt-9">{children}</View>
    </View>
  )
}
