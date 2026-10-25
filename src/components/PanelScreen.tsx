import { useNavigation } from '@react-navigation/native'

import { Platform, View } from 'react-native'

import { Text } from '@/components/AppText'
import { ScreenHeader } from '@/components/ScreenHeader'

// 패널 상단 shadow (y 음수) — 진단요청 화면과 동일
const PANEL_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  android: { elevation: 4 },
})

type PanelScreenProps = {
  title: string
  subtitle: string
  onBack?: () => void
  children: React.ReactNode
}

// 뒤로가기 + 큰 제목/설명 + 상단 라운드 패널 — Figma 고객 마이페이지 하위 화면
// (저장한 명인 / 리뷰작성 / 내가 작성한 리뷰) 공통 레이아웃. 패널 안에 목록·빈 상태를 넣는다.
export function PanelScreen({ title, subtitle, onBack, children }: PanelScreenProps) {
  const navigation = useNavigation()

  return (
    <View className="flex-1 bg-[#F2F2F2]">
      <ScreenHeader onBack={onBack ?? (() => navigation.goBack())} />
      {/* Figma: 네비바 아래 16 → 제목(28) → 9 → 설명(12) → 20 → 패널 */}
      <View className="px-[26px] pb-5 pt-4">
        <Text
          className="text-[28px] text-[#1F2A43]"
          style={{ fontFamily: 'Pretendard-ExtraBold' }}
        >
          {title}
        </Text>
        <Text
          className="mt-[9px] text-[12px] text-[#74768E]"
          style={{ fontFamily: 'Pretendard-Medium' }}
        >
          {subtitle}
        </Text>
      </View>

      <View className="flex-1 rounded-t-2xl bg-[#F2F2F2]" style={PANEL_SHADOW}>
        {children}
      </View>
    </View>
  )
}
