import { useEffect, useRef } from 'react'
import { Animated, Pressable } from 'react-native'

import { Text } from '@/components/AppText'

export type HomeMode = 'expert' | 'customer'

// 트랙 80 - 좌우 inset 2*2 - pill 37 = 이동 거리 39
const PILL_TRAVEL = 39

type ModeToggleProps = {
  mode: HomeMode
  onPress: () => void
  disabled?: boolean
}

/** 명인/고객 모드 토글 — Figma: 명인모드 = 왼쪽 pill, 고객모드 = 오른쪽 pill. 모드 변경 시 좌우로 슬라이드 */
export function ModeToggle({ mode, onPress, disabled }: ModeToggleProps) {
  const translateX = useRef(new Animated.Value(mode === 'expert' ? 0 : PILL_TRAVEL)).current

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: mode === 'expert' ? 0 : PILL_TRAVEL,
      duration: 220,
      useNativeDriver: true,
    }).start()
  }, [mode, translateX])

  return (
    <Pressable
      hitSlop={8}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel="모드 전환"
      accessibilityState={{ checked: mode === 'expert' }}
      className="h-[20px] w-[80px] justify-center overflow-hidden rounded-[10px] bg-gray2"
    >
      <Animated.View
        className="absolute bottom-[2px] left-[2px] top-[2px] w-[37px] items-center justify-center rounded-[8px] bg-[#F2F2F2]"
        style={{ transform: [{ translateX }] }}
      >
        <Text className="font-pretendard-semibold text-gray3" style={{ fontSize: 7, lineHeight: 14 }}>
          {mode === 'expert' ? '명인모드' : '고객모드'}
        </Text>
      </Animated.View>
    </Pressable>
  )
}
