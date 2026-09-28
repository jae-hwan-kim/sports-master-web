import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ArrowBackIcon } from '@/assets/icons'

type ScreenHeaderProps = {
  onBack: () => void
}

// 뒤로가기(+옵션 설정) 아이콘이 있는 화면 상단 네비게이션 바 — Login/SignUp 등 여러 화면에서
// 각자 복붙하던 걸 공용화. 여백 계산(insets.top 등)을 한 곳에서만 관리해 화면 간 불일치를 막는다.
export function ScreenHeader({ onBack }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets()

  return (
    // Figma의 "상단여백 54px"는 기기 상태바 안전영역을 나타내는 자리표시 값 — 실기기에서는
    // 고정 54를 더하는 게 아니라 실제 insets.top으로 대체해야 함(고정값+insets.top을 같이 더하면 이중 계산됨)
    <View className="h-14 flex-row items-center px-4" style={{ marginTop: insets.top }}>
      <Pressable
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="뒤로가기"
        onPress={onBack}
      >
        <ArrowBackIcon />
      </Pressable>
    </View>
  )
}
