import { useState } from 'react'

import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native'

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
        className={`h-14 flex-row items-center rounded-xl border px-4 ${
          hasError ? 'border-[#ea4335]' : isFocused ? 'border-primary' : 'border-gray1'
        }`}
      >
        <TextInput
          className="flex-1 text-[18px] font-medium text-black"
          placeholderTextColor="#74768E"
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
            className="h-full items-center justify-center px-2"
          >
            <Text className="text-[13px] font-medium text-gray2">
              {isSecure ? '표시' : '숨김'}
            </Text>
          </Pressable>
        )}
      </View>
      {hasError && (
        <Text className="mt-1 text-[13px] font-medium text-[#ea4335]">{errorMessage}</Text>
      )}
    </View>
  )
}
