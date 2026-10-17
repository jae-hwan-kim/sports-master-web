import { Pressable } from 'react-native'

import { Text } from '@/components/AppText'

type ChipProps = {
  label: string
  selected?: boolean
  onPress?: () => void
  variant?: 'primary' | 'dark' | 'onboarding'
}

export function Chip({ label, selected = false, onPress, variant = 'primary' }: ChipProps) {
  if (variant === 'onboarding') {
    return (
      <Pressable
        hitSlop={8}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected }}
        className={`h-[26px] items-center justify-center rounded-full border px-3 ${
          selected ? 'border-primary bg-primary' : 'border-gray2 bg-gray2'
        }`}
      >
        <Text
          className={`font-pretendard-medium ${selected ? 'text-black' : 'text-white'}`}
          style={{ fontSize: 13, lineHeight: 22 }}
        >
          {label}
        </Text>
      </Pressable>
    )
  }

  const selectedBg = variant === 'dark' ? 'border-gray3 bg-gray3' : 'border-primary bg-primary'

  return (
    <Pressable
      hitSlop={8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      className={`h-[24px] items-center justify-center rounded-full border px-4 ${
        selected ? selectedBg : 'border-gray1 bg-white'
      }`}
    >
      <Text
        className={`font-medium ${selected ? 'text-white' : 'text-gray3'}`}
        style={{ fontSize: 13 }}
      >
        {label}
      </Text>
    </Pressable>
  )
}
