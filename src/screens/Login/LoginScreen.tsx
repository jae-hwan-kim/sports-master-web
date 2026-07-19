import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigation } from '@react-navigation/native'
import { Controller, useForm } from 'react-hook-form'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { moderateScale } from 'react-native-size-matters'
import { z } from 'zod'

import { AppleIcon, ArrowBackIcon, GoogleIcon, KakaoIcon, SettingsIcon } from '@/assets/icons'
import { Button } from '@/components/Button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { TextField } from '@/components/TextField'

// TODO: useMutation(로그인 API) — 백엔드 API 미확정으로 자리만 표시
// const { mutate: login, isPending } = useLoginMutation()

const loginSchema = z.object({
  email: z
    .string()
    .min(1, '*이메일을 입력해주세요')
    .email('올바르지 않은 이메일 형식입니다'),
  password: z
    .string()
    .min(1, '*비밀번호를 입력해주세요')
    .regex(/^(?=.*[a-z])(?=.*[0-9]).{1,8}$/, '비밀번호는 소문자, 숫자를 포함한 8자 이내입니다'),
})

type LoginFormValues = z.infer<typeof loginSchema>

type SocialProvider = 'google' | 'kakao' | 'apple'

const SOCIAL_LABEL: Record<SocialProvider, string> = {
  google: '구글',
  kakao: '카카오',
  apple: '애플',
}

export function LoginScreen() {
  const navigation = useNavigation()
  const [autoLogin, setAutoLogin] = useState(false)
  const [socialDialog, setSocialDialog] = useState<SocialProvider | null>(null)
  const [autoLoginDialogVisible, setAutoLoginDialogVisible] = useState(false)
  const insets = useSafeAreaInsets()
  const smallFontSize = moderateScale(13)

  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleFormSubmit(() => {
    // TODO: useMutation(로그인 API) 연동 — 백엔드 API 미확정으로 자리만 표시
  })

  const handleAutoLoginPress = () => {
    if (autoLogin) {
      setAutoLogin(false)
      return
    }
    setAutoLoginDialogVisible(true)
  }

  const handleSocialConfirm = () => {
    // TODO: OAuth 연동 미구현 — 실제 소셜 로그인 SDK 연결 필요
    console.log(`[TODO] ${socialDialog} 소셜 로그인 연동`)
    setSocialDialog(null)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
    >
      {/* Navigation Bar — 본문과 다른 16px 인셋을 쓰므로 별도 영역으로 분리 */}
      <View
        className="h-14 flex-row items-center justify-between px-4"
        style={{ paddingTop: insets.top }}
      >
        <Pressable
          hitSlop={8}
          className="h-11 w-11 items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <ArrowBackIcon size={24} />
        </Pressable>
        <Pressable hitSlop={8} className="h-11 w-11 items-center justify-center">
          <SettingsIcon size={24} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-[26px]"
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <Text
          className="mt-[34px] font-extrabold text-black"
          style={{ fontSize: moderateScale(28) }}
        >
          로그인
        </Text>
        <Text className="mt-2 font-medium text-gray2" style={{ fontSize: smallFontSize }}>
          최근에 이용한 항목으로 로그인 해주세요
        </Text>

        {/* 입력 폼 */}
        <View className="mt-[60px] gap-4">
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <TextField
                label="이메일"
                value={value}
                onChangeText={onChange}
                errorMessage={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange } }) => (
              <TextField
                label="비밀번호(영소문자+숫자 조합 8자리)"
                value={value}
                onChangeText={onChange}
                errorMessage={errors.password?.message}
                secureToggle
                secureTextEntry
              />
            )}
          />
        </View>

        {/* 로그인 버튼 */}
        <View className="mt-[20px]">
          <Button label="로그인" variant="primary" onPress={onSubmit} />
        </View>

        {/* 자동로그인 / 비밀번호 찾기 */}
        <View className="mt-4 flex-row items-center justify-between">
          <Pressable
            hitSlop={8}
            className="min-h-11 justify-center"
            onPress={handleAutoLoginPress}
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
        <View className="mt-[60px] flex-row items-center gap-3">
          <View className="h-px flex-1 bg-gray1" />
          <Text className="font-medium text-gray2" style={{ fontSize: smallFontSize }}>
            or 아래 계정으로 로그인
          </Text>
          <View className="h-px flex-1 bg-gray1" />
        </View>

        {/* 소셜 로그인 */}
        <View className="mt-[20px] flex-row items-center gap-3">
          <Button
            label="구글로 로그인"
            variant="socialIcon"
            icon={<GoogleIcon size={24} />}
            onPress={() => setSocialDialog('google')}
          />
          <Button
            label="카카오로 로그인"
            variant="socialIcon"
            icon={<KakaoIcon size={24} />}
            onPress={() => setSocialDialog('kakao')}
          />
          <Button
            label="애플로 로그인"
            variant="socialIcon"
            icon={<AppleIcon size={24} />}
            onPress={() => setSocialDialog('apple')}
          />
        </View>

        {/* 회원가입 안내 (좌우 짧은 구분선이 텍스트를 감싸는 패턴) */}
        <View className="mt-[28px] flex-row items-center gap-3">
          <View className="h-px flex-1 bg-gray1" />
          <View className="flex-row items-center gap-1">
            <Text className="font-medium text-gray2" style={{ fontSize: smallFontSize }}>
              계정이 없으신가요?
            </Text>
            <Pressable hitSlop={8} className="min-h-11 justify-center">
              <Text className="font-semibold text-gray3" style={{ fontSize: smallFontSize }}>
                회원가입
              </Text>
            </Pressable>
          </View>
          <View className="h-px flex-1 bg-gray1" />
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

      <ConfirmDialog
        visible={socialDialog !== null}
        title={socialDialog ? `${SOCIAL_LABEL[socialDialog]}로 로그인하기` : ''}
        description="계정연동을 위한 화면으로 이동합니다"
        onConfirm={handleSocialConfirm}
        onCancel={() => setSocialDialog(null)}
      />
      <ConfirmDialog
        visible={autoLoginDialogVisible}
        title="자동 로그인 설정"
        description="다음 앱 시작 시 자동으로 로그인 됩니다"
        onConfirm={() => {
          setAutoLogin(true)
          setAutoLoginDialogVisible(false)
        }}
        onCancel={() => setAutoLoginDialogVisible(false)}
      />
    </KeyboardAvoidingView>
  )
}
