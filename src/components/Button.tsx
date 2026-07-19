import { ActivityIndicator, Pressable, Text } from 'react-native'
import { moderateScale, verticalScale } from 'react-native-size-matters'

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
    ? disabled
      ? 'bg-gray1'
      : 'bg-primary'
    : 'border border-gray1 bg-white'

  if (isSocialIcon) {
    return (
      <Pressable
        hitSlop={8}
        disabled={disabled}
        onPress={onPress}
        accessibilityLabel={label}
        className="flex-1 items-center justify-center rounded-lg border border-gray1 bg-white"
        style={{ height: verticalScale(50) }}
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
      className={`w-full flex-row items-center justify-center rounded-lg ${bgClass} ${
        !isPrimary && icon ? 'gap-2' : ''
      }`}
      style={{ height: verticalScale(56) }}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#F2F2F2' : '#07091C'} />
      ) : (
        <>
          {icon}
          <Text
            className={`font-medium ${isPrimary ? 'text-white' : 'text-black'}`}
            style={{ fontSize: moderateScale(17) }}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  )
}
