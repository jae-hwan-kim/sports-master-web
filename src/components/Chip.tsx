import { Pressable, Text } from 'react-native'
import { moderateScale, scale, verticalScale } from 'react-native-size-matters'

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
      className={`items-center justify-center rounded-full border ${
        selected ? selectedBg : 'border-gray1 bg-white'
      }`}
      style={{ height: verticalScale(36), paddingHorizontal: scale(16) }}
    >
      <Text
        className={`font-medium ${selected ? 'text-white' : 'text-gray3'}`}
        style={{ fontSize: moderateScale(13) }}
      >
        {label}
      </Text>
    </Pressable>
  )
}
