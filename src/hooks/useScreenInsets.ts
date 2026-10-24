import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// Figma 프레임 상단 '여백'(상태바) 높이 — 콘텐츠는 항상 이 아래에서 시작
const FIGMA_STATUS_BAR_HEIGHT = 54
// Figma 하단 탭 아래 여백(홈 인디케이터) 높이
const FIGMA_HOME_INDICATOR_HEIGHT = 34
// Android 시스템 내비게이션 바(3버튼/제스처) 위에 두는 추가 여백
const ANDROID_TAB_BAR_EXTRA = 12

// Android는 insets.top(≈24~40)이 Figma 상태바(54)보다 작아 콘텐츠가 위로 붙음 → 최소값 보정
export function useScreenInsets() {
  const insets = useSafeAreaInsets()
  return {
    ...insets,
    top: Math.max(insets.top, FIGMA_STATUS_BAR_HEIGHT),
    tabBarBottom:
      Platform.OS === 'android'
        ? insets.bottom + ANDROID_TAB_BAR_EXTRA
        : Math.max(insets.bottom, FIGMA_HOME_INDICATOR_HEIGHT),
  }
}
