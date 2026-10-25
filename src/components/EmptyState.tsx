import { useState } from 'react'
import { View } from 'react-native'

import LogoSvg from '@/assets/icons/logo.svg'
import { Text } from '@/components/AppText'

// Figma 로고 원본 크기 (진단요청_empty '아트보드 4 3')
const LOGO_WIDTH = 276
const LOGO_HEIGHT = 278
// 이보다 작으면 로고가 장식 역할을 못 하므로 숨김
const LOGO_MIN = 80

type EmptyStateProps = {
  title: string
  tip?: string
}

// 목록 패널의 빈 상태 — Figma 진단요청_empty 기준: 패널 약 1/3 지점에 문구, 그 아래 남은 공간에 로고.
// 로고는 문구 아래 영역 높이에 맞춰 줄어들어 작은 화면에서도 문구를 덮지 않는다.
export function EmptyState({ title, tip }: EmptyStateProps) {
  const [logoAreaHeight, setLogoAreaHeight] = useState(0)
  const logoHeight = Math.min(LOGO_HEIGHT, logoAreaHeight)

  return (
    <View className="flex-1">
      <View className="h-[30%]" />
      <View className="items-center gap-3">
        <Text
          className="text-center text-[18px] text-[#74768E]"
          style={{ fontFamily: 'Pretendard-ExtraBold' }}
        >
          {title}
        </Text>
        {tip && (
          <Text
            className="text-center text-[12px] text-[#74768E]"
            style={{ fontFamily: 'Pretendard-Medium' }}
          >
            {tip}
          </Text>
        )}
      </View>
      {/* Figma: 문구 아래 30px, 화면 가로 중앙에서 시작해 우측으로 삐져나옴 */}
      <View
        className="mt-[30px] flex-1"
        onLayout={(e) => setLogoAreaHeight(e.nativeEvent.layout.height)}
      >
        {logoHeight >= LOGO_MIN && (
          <View className="absolute bottom-0 left-1/2">
            <LogoSvg width={logoHeight * (LOGO_WIDTH / LOGO_HEIGHT)} height={logoHeight} />
          </View>
        )}
      </View>
    </View>
  )
}
