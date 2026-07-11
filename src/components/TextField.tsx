import { useState } from 'react'

import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native'
import { moderateScale, verticalScale } from 'react-native-size-matters'

import { VisibilityIcon } from '@/assets/icons'

type TextFieldProps = TextInputProps & {
  label?: string
  errorMessage?: string
  secureToggle?: boolean
}

export function TextField({
  label,
  errorMessage,
  secureToggle = false,
  secureTextEntry,
  ...rest
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isSecure, setIsSecure] = useState(secureTextEntry ?? false)

  const hasError = !!errorMessage

  return (
    <View className="w-full">
      <View
        className={`flex-row items-center rounded-lg border bg-gray1 px-4 ${
          hasError ? 'border-[#ea4335]' : isFocused ? 'border-secondary' : 'border-transparent'
        }`}
        style={{ height: verticalScale(50) }}
      >
        <TextInput
          className="flex-1 font-medium text-black"
          style={{ fontSize: moderateScale(16) }}
          placeholderTextColor="rgba(0,0,0,0.2)"
          placeholder={label}
          secureTextEntry={secureToggle ? isSecure : secureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        {secureToggle && (
          <Pressable
            hitSlop={8}
            onPress={() => setIsSecure((prev) => !prev)}
            className="h-11 w-11 items-center justify-center"
          >
            <VisibilityIcon size={24} off={isSecure} />
          </Pressable>
        )}
      </View>
      {hasError && (
        <Text className="mt-1 font-medium text-[#ea4335]" style={{ fontSize: moderateScale(13) }}>
          {errorMessage}
        </Text>
      )}
    </View>
  )
}
