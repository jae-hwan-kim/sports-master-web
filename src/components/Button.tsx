import { ActivityIndicator, Pressable, Text } from 'react-native'
import { moderateScale } from 'react-native-size-matters'

type ButtonVariant = 'primary' | 'social' | 'socialIcon'

type ButtonProps = {
  label: string
  onPress?: () => void
  variant?: ButtonVariant
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
}: ButtonProps) {
  const isPrimary = variant === 'primary'
  const isSocialIcon = variant === 'socialIcon'
  const bgClass = isPrimary
    ? `${disabled ? 'bg-gray1' : 'bg-gray3'} border border-gray2`
    : 'border border-gray1 bg-white'

  if (isSocialIcon) {
    return (
      <Pressable
        hitSlop={8}
        disabled={disabled}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        className="h-[50px] flex-1 items-center justify-center rounded-lg border border-gray1 bg-white"
      >
        {icon}
      </Pressable>
    )
  }

  return (
    <Pressable
      hitSlop={8}
      disabled={disabled || loading}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading }}
      className={`h-[50px] w-full flex-row items-center justify-center rounded-lg ${bgClass} ${
        !isPrimary && icon ? 'gap-2' : ''
      }`}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#F2F2F2' : '#07091C'} />
      ) : (
        <>
          {icon}
          <Text
            className={`font-medium ${isPrimary ? 'text-[#F2F2F2]' : 'text-black'}`}
            style={{ fontSize: moderateScale(17) }}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  )
}
