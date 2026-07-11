import { ActivityIndicator, Pressable, Text } from 'react-native'

type ButtonVariant = 'primary' | 'social'

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
  const bgClass = isPrimary
    ? disabled
      ? 'bg-gray1'
      : 'bg-primary'
    : 'border border-gray1 bg-white'

  return (
    <Pressable
      hitSlop={8}
      disabled={disabled || loading}
      onPress={onPress}
      className={`h-14 w-full flex-row items-center justify-center rounded-xl ${bgClass} ${
        !isPrimary && icon ? 'gap-2' : ''
      }`}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#F2F2F2' : '#07091C'} />
      ) : (
        <>
          {icon}
          <Text className={`text-[18px] font-medium ${isPrimary ? 'text-white' : 'text-black'}`}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  )
}
