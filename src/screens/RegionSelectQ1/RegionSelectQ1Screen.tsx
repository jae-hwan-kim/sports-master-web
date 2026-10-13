import { useCallback, useState } from 'react'
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Path } from 'react-native-svg'

import { ArrowBackIcon, SettingsIcon } from '@/assets/icons'
import { Text } from '@/components/AppText'
import { RegionSelectBottomSheet } from '@/components/onboarding/RegionSelectBottomSheet'
import { useRegions } from '@/hooks/useRegions'
import { RootStackParamList } from '@/navigation/RootNavigator'
import { useOnboardingStore } from '@/store/onboardingStore'

// ProgressBar — 전체 폭 대비 32% 진행(≈109/338px, Q1 기준)
const PROGRESS = 0.32

// 드롭다운 내 아래 방향 chevron (rotate 90deg)
function ChevronIcon() {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      style={{ transform: [{ rotate: '90deg' }] }}
    >
      <Path
        d="M9 18l6-6-6-6"
        stroke="#D9D9D9"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

const styles = StyleSheet.create({
  nextButton: {
    ...Platform.select({
      ios: {
        shadowColor: '#062246',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
})

export function RegionSelectQ1Screen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  // insets.top/bottom은 런타임 동적 값 — style 사용 의도적 예외
  const insets = useSafeAreaInsets()
  const [isOpen, setIsOpen] = useState(false)
  const { data: regions } = useRegions()

  // 온보딩 store에서 초기값 읽기 (뒤로 갔다 돌아왔을 때 복원)
  const storedRegions = useOnboardingStore((s) => s.selectedRegions)
  const setSelectedRegionsInStore = useOnboardingStore((s) => s.setSelectedRegions)

  const [selectedRegions, setSelectedRegions] = useState<string[]>(storedRegions)

  const handleToggle = useCallback((region: string) => {
    setSelectedRegions((prev) => {
      if (prev.includes(region)) return prev.filter((r) => r !== region)
      if (prev.length >= 3) {
        Alert.alert('알림', '지역은 최대 3개까지 선택할 수 있습니다.')
        return prev
      }
      return [...prev, region]
    })
  }, [])

  const handleConfirm = useCallback(() => setIsOpen(false), [])

  const handleNext = useCallback(() => {
    if (selectedRegions.length === 0) return
    // 온보딩 store에 저장 — 이후 Q 화면 및 최종 제출 시 사용
    setSelectedRegionsInStore(selectedRegions)
    navigation.navigate('OnboardingQ2GenderAge')
  }, [selectedRegions, setSelectedRegionsInStore, navigation])

  const canProceed = selectedRegions.length > 0

  return (
    <View className="flex-1 bg-[#07091C]">
      {/* NavigationBar */}
      <View
        className="h-14 flex-row items-center justify-between px-4"
        style={{ marginTop: insets.top }}
      >
        <Pressable
          hitSlop={8}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
        >
          <ArrowBackIcon />
        </Pressable>
        {/* 설정 화면: 온보딩 시점에는 역할 미확정 — CustomerSettings 임시 사용 (note 참고) */}
        <Pressable
          hitSlop={8}
          onPress={() => navigation.navigate('CustomerSettings')}
          accessibilityRole="button"
          accessibilityLabel="설정"
        >
          <SettingsIcon />
        </Pressable>
      </View>

      {/* ProgressBar — 전체 폭(mx-8 = 좌우 32px), 높이 2px */}
      <View className="mx-8 mt-3" style={{ height: 2 }}>
        <View className="absolute inset-0 rounded-full bg-[#D9D9D9]" />
        <View
          className="absolute left-0 h-full rounded-full bg-[#C6A75E]"
          style={{ width: `${PROGRESS * 100}%` }}
        />
      </View>

      {/* 콘텐츠 영역 — 상하 flex 스페이서로 Q1 블록을 수직 중앙 부근에 배치 */}
      <View className="flex-1">
        <View style={{ flex: 1 }} />

        {/* Q1 레이블 */}
        <View className="items-center">
          <Text
            style={{
              fontFamily: 'Pretendard-Medium',
              fontSize: 36,
              lineHeight: 36,
              color: '#C6A75E',
            }}
          >
            Q1
          </Text>
        </View>

        {/* 질문 제목 + 부제 */}
        <View className="mt-3 items-center px-8">
          <Text
            className="text-center"
            style={{
              fontFamily: 'Pretendard-Medium',
              fontSize: 24,
              lineHeight: 36,
              color: '#F2F2F2',
            }}
          >
            어떤 지역의 명인을 찾으시나요?
          </Text>
          <Text
            className="text-center"
            style={{ fontFamily: 'Pretendard-Medium', fontSize: 17, color: '#A2A2A2' }}
          >
            (최대 3개 선택가능)
          </Text>
        </View>

        {/* RegionDropdown 트리거 */}
        <Pressable
          hitSlop={8}
          onPress={() => setIsOpen(true)}
          className="mx-8 mt-6 h-[46px] flex-row items-center justify-between px-3"
          style={{
            backgroundColor: 'rgba(3,15,35,0.3)',
            borderRadius: 4,
          }}
          accessibilityRole="button"
          accessibilityLabel={
            selectedRegions.length > 0
              ? `선택된 지역: ${selectedRegions.join(', ')}`
              : '지역 선택하기'
          }
        >
          {selectedRegions.length === 0 ? (
            <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 12, color: '#D9D9D9' }}>
              원하는 지역 선택하기
            </Text>
          ) : (
            <Text
              numberOfLines={1}
              style={{
                fontFamily: 'Pretendard-Medium',
                fontSize: 12,
                color: '#F2F2F2',
                flex: 1,
                marginRight: 8,
              }}
            >
              {selectedRegions.join(', ')}
            </Text>
          )}
          <ChevronIcon />
        </Pressable>

        <View style={{ flex: 1 }} />
      </View>

      {/* 하단 그라디언트 오버레이 — pointerEvents="none"으로 버튼 터치 유지 */}
      <LinearGradient
        colors={['rgba(0,19,75,0)', '#1A4B8E', '#429EF4']}
        locations={[0, 0.688, 1.0]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 239,
        }}
        pointerEvents="none"
      />

      {/* 다음으로 버튼 */}
      <View
        className="px-[14px]"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Pressable
          hitSlop={0}
          onPress={handleNext}
          disabled={!canProceed}
          className="h-[69px] items-center justify-center rounded-2xl"
          style={[
            styles.nextButton,
            {
              backgroundColor: 'rgba(16,51,111,0.41)',
              opacity: canProceed ? 1 : 0.5,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="다음으로"
          accessibilityState={{ disabled: !canProceed }}
        >
          <Text
            style={{
              fontFamily: 'Pretendard-Regular',
              fontSize: 16,
              color: 'rgba(242,242,242,0.85)',
            }}
          >
            다음으로
          </Text>
        </Pressable>
      </View>

      {/* 지역 선택 바텀 시트 */}
      <RegionSelectBottomSheet
        visible={isOpen}
        selectedRegions={selectedRegions}
        regions={regions}
        onToggle={handleToggle}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
      />
    </View>
  )
}
