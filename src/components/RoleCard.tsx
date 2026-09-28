import { Pressable, Text, View } from 'react-native'

import { CustomerIcon, MasterIcon } from '@/assets/icons'

type RoleCardVariant = 'master' | 'customer'

type RoleCardProps = {
  variant: RoleCardVariant
  title: string
  description: string
  selected?: boolean
  onPress?: () => void
  disabled?: boolean
}

// 명인/고객 두 카드만 존재하는 고정 컴포넌트 — 반복 리스트가 아니므로 map/FlatList 불필요
// Figma 구조: 바깥 카드(300x200, radius 16) 안에 25px 인셋의 보더 박스(250x150, radius 12)가 하나 더 있고,
// 그 안에 타이틀+설명이, 박스 모서리에 아이콘 배지가 겹쳐서 걸쳐있음.
// selected=false: 내부 박스만 옅은 골드 실선 보더 / selected=true: 내부 보더는 그대로 유지한 채
// 바깥 카드에 솔리드 골드(#B48247) 보더 4px를 별도 오버레이로 추가해 하이라이트(1차 탭 = 선택, 재탭 = 확정은 상위에서 처리)
export function RoleCard({ variant, title, description, selected = false, onPress, disabled }: RoleCardProps) {

  return (
    <Pressable
      hitSlop={8}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title}. ${description}${selected ? '. 선택됨. 한 번 더 눌러 확정' : ''}`}
      className={`h-[200px] w-[300px] rounded-2xl bg-[#FFFFFF] ${disabled ? 'opacity-50' : ''}`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12.7,
        elevation: 4,
      }}
    >
      <View
        className="absolute left-[25px] top-[25px] h-[150px] w-[250px] items-center justify-center rounded-xl border border-[#C6A75E] px-4"
      >
        <Text className={`text-2xl font-semibold`}>
          {title}
        </Text>
        <Text className="mt-2 text-center text-[13px] font-medium leading-[1.4] text-gray2">
          {description}
        </Text>
      </View>
      <RoleIcon variant={variant} />
      {selected ? (
        <View
          pointerEvents="none"
          className="absolute inset-0 h-[200px] w-[300px] rounded-2xl border-4 border-[#B48247]"
        />
      ) : null}
    </Pressable>
  )
}

function RoleIcon({ variant }: { variant: RoleCardVariant }) {
  // Figma: 명인 아이콘(훈장)은 우하단(right-0), 고객 아이콘(픽토그램)은 좌하단(left-0)에 위치
  const positionClass = variant === 'master' ? 'bottom-0 right-0' : 'bottom-0 left-0'
  const Icon = variant === 'master' ? MasterIcon : CustomerIcon

  return (
    <View className={`absolute ${positionClass} h-[54px] w-[54px] items-center justify-center`}>
      <Icon size={54} />
    </View>
  )
}
