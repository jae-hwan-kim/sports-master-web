import { forwardRef } from 'react'
import {
  Platform,
  Text as RNText,
  TextInput as RNTextInput,
  type TextInputProps,
  type TextProps,
} from 'react-native'

// 시스템 글자 크기(iOS 더 큰 텍스트 / Android 글꼴 크기) 확대 상한.
// 고정 높이 컨테이너(h-[50px] 등)가 1.2배까지는 깨지지 않도록 디자인/구현할 것.
export const MAX_FONT_SCALE = 1.2

// Android 는 폰트 상하에 여백(font padding)을 추가해 Figma/iOS 대비 텍스트가 아래로 밀린다
const platformTextStyle = Platform.OS === 'android' ? { includeFontPadding: false } : null

// react-native 의 Text/TextInput 대신 이 모듈을 import 할 것 (eslint no-restricted-imports 로 강제)
export const Text = forwardRef<RNText, TextProps>(function Text({ style, ...props }, ref) {
  return (
    <RNText
      ref={ref}
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      {...props}
      style={[platformTextStyle, style]}
    />
  )
})

export const TextInput = forwardRef<RNTextInput, TextInputProps>(function TextInput(
  { style, ...props },
  ref
) {
  return (
    <RNTextInput
      ref={ref}
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      {...props}
      style={[platformTextStyle, style]}
    />
  )
})

// ref 타입용 (예: forwardRef<TextInput, ...>, useRef<TextInput>(null))
export type Text = RNText
export type TextInput = RNTextInput
