import { Pressable } from 'react-native'

import { Text } from '@/components/AppText'

type ChipProps = {
  label: string
  selected?: boolean
  onPress?: () => void
  variant?: 'primary' | 'dark'
}

export function Chip({ label, selected = false, onPress, variant = 'primary' }: ChipProps) {
  const selectedBg = variant === 'dark' ? 'border-gray3 bg-gray3' : 'border-primary bg-primary'

  return (
    <Pressable
      hitSlop={8}
      onPress={onPress}
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
