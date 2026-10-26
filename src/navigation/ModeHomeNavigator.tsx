import { useNavigation } from '@react-navigation/native'
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack'

import { useEffect, useRef, useState } from 'react'
import { Animated, Pressable, View } from 'react-native'

import { SettingsIcon } from '@/assets/icons'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { HomeGreeting } from '@/components/HomeGreeting'
import { type HomeMode, ModeToggle } from '@/components/ModeToggle'
import { useScreenInsets } from '@/hooks/useScreenInsets'
import { useSwitchMode } from '@/hooks/useSwitchMode'
import { CustomerTabNavigator } from '@/navigation/CustomerTabNavigator'
import { MasterTabNavigator } from '@/navigation/MasterTabNavigator'
import type { RootStackParamList } from '@/navigation/RootNavigator'
import { useAuthStore } from '@/store/authStore'
import { useReviewLinkStore } from '@/store/reviewLinkStore'

// 홈 탭 이름 — 이 탭이 포커스일 때만 공용 상단(인사말 + 모드 토글 + 설정)을 표시
const HOME_TABS = ['HomeTab', 'CustomerHomeTab']

const MODE_LABEL: Record<HomeMode, string> = { expert: '명인모드', customer: '고객모드' }

type Props = NativeStackScreenProps<RootStackParamList, 'MasterHome' | 'CustomerHome'>

// 명인/고객 탭 네비게이터를 한 화면에서 교체하는 홈 컨테이너.
// 상단은 모드와 무관하게 유지되고 토글만 슬라이드 — 아래 탭 영역만 페이드로 교체돼 전체 새로고침처럼 보이지 않는다.
// 각 홈 화면은 상단 높이(insets.top + 56)만큼 비워두고, 실제 상단은 여기서 overlay로 그린다.
export function ModeHomeNavigator({ route }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useScreenInsets()
  const setModeSelected = useAuthStore((s) => s.setModeSelected)
  const { mutate: switchMode, isPending: isSwitching } = useSwitchMode()

  const [mode, setMode] = useState<HomeMode>(route.name === 'MasterHome' ? 'expert' : 'customer')
  const [focusedTab, setFocusedTab] = useState(HOME_TABS[0])
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [errorVisible, setErrorVisible] = useState(false)
  const contentOpacity = useRef(new Animated.Value(1)).current

  const nextMode: HomeMode = mode === 'expert' ? 'customer' : 'expert'

  // 리뷰 링크로 들어온 경우 — 로그인된 홈에 도달한 시점에 리뷰 작성 화면으로 이동
  const pendingReviewToken = useReviewLinkStore((s) => s.pendingToken)
  useEffect(() => {
    if (!pendingReviewToken) return
    useReviewLinkStore.getState().clearPendingToken()
    navigation.navigate('ReviewWrite', { reviewToken: pendingReviewToken })
  }, [pendingReviewToken, navigation])

  const handleSwitchConfirm = () => {
    setConfirmVisible(false)
    switchMode(
      { mode: nextMode },
      {
        onSuccess: () => {
          setModeSelected(nextMode)
          contentOpacity.setValue(0)
          setMode(nextMode)
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }).start()
        },
        onError: () => setErrorVisible(true),
      }
    )
  }

  const onTabFocus = (tabName: string) => setFocusedTab(tabName)

  return (
    <View className="flex-1 bg-[#F2F2F2]">
      <Animated.View className="flex-1" style={{ opacity: contentOpacity }}>
        {mode === 'expert' ? (
          <MasterTabNavigator onTabFocus={onTabFocus} />
        ) : (
          <CustomerTabNavigator onTabFocus={onTabFocus} />
        )}
      </Animated.View>

      {HOME_TABS.includes(focusedTab) && (
        <View
          pointerEvents="box-none"
          className="absolute left-0 right-0 top-0 px-4"
          style={{ paddingTop: insets.top }}
        >
          <View className="h-14 flex-row items-center">
            <HomeGreeting />
            <View className="flex-row items-center">
              {/* 전환 요청 중에는 토글을 먼저 이동 — 실패 시 원위치 */}
              <ModeToggle
                mode={isSwitching ? nextMode : mode}
                onPress={() => setConfirmVisible(true)}
                disabled={isSwitching}
              />
              <Pressable
                hitSlop={8}
                onPress={() =>
                  navigation.navigate(mode === 'expert' ? 'MasterSettings' : 'CustomerSettings')
                }
                accessibilityRole="button"
                accessibilityLabel="설정"
              >
                <SettingsIcon size={44} color="#1F2A43" />
              </Pressable>
            </View>
          </View>
        </View>
      )}

      <ConfirmDialog
        visible={confirmVisible}
        title={`${MODE_LABEL[nextMode]}로 전환`}
        description={`${MODE_LABEL[nextMode]}로 전환합니까?`}
        confirmLabel="전환하기"
        cancelLabel="취소"
        onConfirm={handleSwitchConfirm}
        onCancel={() => setConfirmVisible(false)}
      />

      <ConfirmDialog
        visible={errorVisible}
        title="모드 전환 실패"
        description="잠시 후 다시 시도해주세요"
        onConfirm={() => setErrorVisible(false)}
      />
    </View>
  )
}
