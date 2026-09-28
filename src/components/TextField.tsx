import { forwardRef, useState } from 'react'
import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native'
import { moderateScale } from 'react-native-size-matters'

import { VisibilityIcon } from '@/assets/icons'

type TextFieldProps = TextInputProps & {
  label?: string
  errorMessage?: string
  secureToggle?: boolean
  rightButton?: React.ReactNode
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    errorMessage,
    secureToggle = false,
    secureTextEntry,
    onFocus,
    onBlur,
    rightButton,
    ...rest
  },
  ref
) {
  const [isFocused, setIsFocused] = useState(false)
  const [isSecure, setIsSecure] = useState(secureTextEntry ?? false)

  const hasError = !!errorMessage

  return (
    <View className="w-full">
      <View
        className={`h-[50px] flex-row items-center rounded-lg border bg-gray1 px-4 ${
          hasError ? 'border-[#ea4335]' : isFocused ? 'border-primary' : 'border-transparent'
        }`}
      >
        <TextInput
          ref={ref}
          className="flex-1 font-medium text-black"
          style={{ fontSize: moderateScale(16) }}
          placeholderTextColor="rgba(0,0,0,0.2)"
          placeholder={label}
          secureTextEntry={secureToggle ? isSecure : secureTextEntry}
          onFocus={(e) => {
            setIsFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            onBlur?.(e)
          }}
          {...rest}
        />
        {rightButton ? (
          <View className="ml-2 shrink-0">{rightButton}</View>
        ) : (
          secureToggle && (
            <Pressable
              hitSlop={8}
              onPress={() => setIsSecure((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel={isSecure ? '비밀번호 표시' : '비밀번호 숨기기'}
              className="h-11 w-11 items-center justify-center"
            >
              <VisibilityIcon off={isSecure} />
            </Pressable>
          )
        )}
      </View>
      {hasError && (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          className="mt-1 pl-4 font-medium text-[#ea4335]"
          style={{ fontSize: moderateScale(13) }}
        >
          {errorMessage}
        </Text>
      )}
    </View>
  )
})
