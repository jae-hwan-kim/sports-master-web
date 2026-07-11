import { useState } from 'react'

import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { moderateScale } from 'react-native-size-matters'

import { AppleIcon, ArrowBackIcon, GoogleIcon, KakaoIcon, SettingsIcon } from '@/assets/icons'
import { Button } from '@/components/Button'
import { TextField } from '@/components/TextField'

// TODO: useMutation(로그인 API) — 백엔드 API 미확정으로 자리만 표시
// const { mutate: login, isPending } = useLoginMutation()

type LoginFormState = {
  email: string
  password: string
  autoLogin: boolean
}

type LoginFormErrors = {
  email?: string
  password?: string
}

export function LoginScreen() {
  const [form, setForm] = useState<LoginFormState>({
    email: '',
    password: '',
    autoLogin: false,
  })
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const insets = useSafeAreaInsets()
  const smallFontSize = moderateScale(13)

  const handleChange = (key: keyof Omit<LoginFormState, 'autoLogin'>, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = () => {
    // NOTE: 실제 유효성 검사/API 연동은 미구현. 폼 상태 확인용 자리만 유지.
    setErrors({})
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
    >
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Navigation Bar */}
        <View
          className="h-14 flex-row items-center justify-between"
          style={{ paddingTop: insets.top }}
        >
          <Pressable hitSlop={8} className="h-11 w-11 items-center justify-center">
            <ArrowBackIcon size={24} />
          </Pressable>
          <Pressable hitSlop={8} className="h-11 w-11 items-center justify-center">
            <SettingsIcon size={24} />
          </Pressable>
        </View>

        {/* Title */}
        <Text
          className="mt-4 font-extrabold text-black"
          style={{ fontSize: moderateScale(28) }}
        >
          로그인
        </Text>
        <Text className="mt-2 font-medium text-gray2" style={{ fontSize: smallFontSize }}>
          최근에 이용한 항목으로 로그인 해주세요
        </Text>

        {/* 입력 폼 */}
        <View className="mt-6 gap-3">
          <TextField
            label="이메일"
            value={form.email}
            onChangeText={(text) => handleChange('email', text)}
            errorMessage={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextField
            label="비밀번호(영소문자+숫자 조합 8자리)"
            value={form.password}
            onChangeText={(text) => handleChange('password', text)}
            errorMessage={errors.password}
            secureToggle
            secureTextEntry
          />
        </View>

        {/* 로그인 버튼 */}
        <View className="mt-6">
          <Button label="로그인" variant="primary" onPress={handleSubmit} />
        </View>

        {/* 자동로그인 / 비밀번호 찾기 */}
        <View className="mt-4 flex-row items-center justify-between">
          <Pressable
            hitSlop={8}
            className="min-h-11 justify-center"
            onPress={() => setForm((prev) => ({ ...prev, autoLogin: !prev.autoLogin }))}
          >
            <Text className="font-medium text-gray2" style={{ fontSize: smallFontSize }}>
              자동로그인
            </Text>
          </Pressable>
          <View className="flex-row items-center gap-2">
            <Pressable hitSlop={8} className="min-h-11 justify-center">
              <Text className="font-medium text-gray2" style={{ fontSize: smallFontSize }}>
                비밀번호 찾기
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 구분선 */}
        <View className="mt-8 flex-row items-center gap-3">
          <View className="h-px flex-1 bg-gray1" />
          <Text className="font-medium text-gray2" style={{ fontSize: smallFontSize }}>
            or 아래 계정으로 로그인
          </Text>
          <View className="h-px flex-1 bg-gray1" />
        </View>

        {/* 소셜 로그인 */}
        <View className="mt-4 flex-row items-center gap-3">
          <Button
            label="구글로 로그인"
            variant="socialIcon"
            icon={<GoogleIcon size={24} />}
          />
          <Button
            label="카카오로 로그인"
            variant="socialIcon"
            icon={<KakaoIcon size={24} />}
          />
          <Button
            label="애플로 로그인"
            variant="socialIcon"
            icon={<AppleIcon size={24} />}
          />
        </View>

        {/* 하단 구분선 */}
        <View className="mt-8 h-px w-full bg-gray1" />

        {/* 회원가입 안내 */}
        <View className="mt-4 flex-row items-center justify-center gap-1">
          <Text className="font-medium text-gray2" style={{ fontSize: smallFontSize }}>
            계정이 없으신가요?
          </Text>
          <Pressable hitSlop={8} className="min-h-11 justify-center">
            <Text className="font-semibold text-gray3" style={{ fontSize: smallFontSize }}>
              회원가입
            </Text>
          </Pressable>
        </View>

        {/* 약관 안내 */}
        <View className="mt-6 items-center gap-1">
          <Text
            className="text-center font-normal text-gray2"
            style={{ fontSize: moderateScale(10) }}
          >
            로그인시 아래 내용에 동의하는 것으로 간주됩니다
          </Text>
          <View className="flex-row items-center gap-3">
            <Pressable hitSlop={8} className="min-h-11 justify-center">
              <Text
                className="font-normal text-gray2 underline"
                style={{ fontSize: moderateScale(10) }}
              >
                개인정보 처리방침
              </Text>
            </Pressable>
            <Pressable hitSlop={8} className="min-h-11 justify-center">
              <Text
                className="font-normal text-gray2 underline"
                style={{ fontSize: moderateScale(10) }}
              >
                이용약관
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
