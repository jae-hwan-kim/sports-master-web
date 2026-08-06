import { useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Controller, useForm } from 'react-hook-form'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AppleIcon, GoogleIcon, KakaoIcon } from '@/assets/icons'
import { Button } from '@/components/Button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ScreenHeader } from '@/components/ScreenHeader'
import { TextField } from '@/components/TextField'
import { useAppleLogin } from '@/hooks/useAppleLogin'
import { useGoogleLogin } from '@/hooks/useGoogleLogin'
import { useLogin } from '@/hooks/useLogin'
import { RootStackParamList } from '@/navigation/RootNavigator'
import { useAuthStore } from '@/store/authStore'
import {
  extractApiErrorMessage,
  isInvalidCredentialsError,
  loginSchema,
  type LoginFormValues,
} from '@/utils/loginValidation'

type SocialProvider = 'google' | 'kakao' | 'apple'

const SOCIAL_LABEL: Record<SocialProvider, string> = {
  google: '구글',
  kakao: '카카오',
  apple: '애플',
}

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [autoLogin, setAutoLogin] = useState(false)
  const [socialDialog, setSocialDialog] = useState<SocialProvider | null>(null)
  const [socialLoading, setSocialLoading] = useState(false)
  const [autoLoginDialogVisible, setAutoLoginDialogVisible] = useState(false)
  const [socialError, setSocialError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const insets = useSafeAreaInsets()
  // insets는 런타임 계산 값이라 className으로 표현할 수 없어 style로 최소 사용
  const styles = useMemo(
    () =>
      StyleSheet.create({
        scrollContent: { flexGrow: 1, paddingBottom: insets.bottom + 40 },
      }),
    [insets.bottom]
  )

  const {
    control,
    handleSubmit: handleFormSubmit,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  })

  const { mutate: login, isPending } = useLogin()
  const { mutate: googleLogin, isPending: isGoogleLoginPending } = useGoogleLogin()
  const { mutate: appleLogin, isPending: isAppleLoginPending } = useAppleLogin()
  const setTokens = useAuthStore((state) => state.setTokens)

  const onSubmit = handleFormSubmit((values) => {
    setFormError(null)
    login(values, {
      onSuccess: async (data) => {
        // TODO: expo-secure-store 설치 후 자동로그인(autoLogin) 시 refreshToken을 영구 저장하도록 전환 —
        // 현재는 autoLogin 여부와 무관하게 메모리(zustand)에만 저장되어 앱 재시작 시 소실됨
        setTokens(data.accessToken, data.refreshToken)
      },
      onError: (error) => {
        const message = extractApiErrorMessage(error, '로그인에 실패했습니다. 잠시 후 다시 시도해주세요')
        if (isInvalidCredentialsError(error)) {
          setError('password', { message })
          return
        }
        setFormError(message)
      },
    })
  })

  const handleAutoLoginPress = () => {
    if (autoLogin) {
      setAutoLogin(false)
      return
    }
    setAutoLoginDialogVisible(true)
  }

  const handleSocialConfirm = async () => {
    setSocialError(null)

    if (socialDialog === 'google') {
      setSocialLoading(true)
      try {
        // TODO: expo-auth-session(Google) 설치 후 실제 Google Sign-In 플로우로 idToken 취득 필요
        // 현재 프로젝트에 Google OAuth SDK가 없어 idToken을 발급받을 수 없으므로,
        // SDK 연동 전까지는 아래 호출이 실행되지 않도록 가드한다.
        const idToken: string | null = null
        if (!idToken) {
          throw new Error('GOOGLE_SDK_NOT_INSTALLED')
        }

        googleLogin(
          { idToken },
          {
            onSuccess: (data) => {
              setTokens(data.accessToken, data.refreshToken)
              setSocialLoading(false)
              setSocialDialog(null)
            },
            onError: (error) => {
              setSocialError(extractApiErrorMessage(error, '소셜 로그인에 실패했습니다. 잠시 후 다시 시도해주세요'))
              setSocialLoading(false)
            },
          }
        )
      } catch {
        setSocialError('구글 로그인 SDK가 아직 연동되지 않았습니다. expo-auth-session 설치가 필요합니다')
        setSocialLoading(false)
      }
      return
    }

    if (socialDialog === 'apple') {
      setSocialLoading(true)
      try {
        // TODO: expo-apple-authentication 설치 후 실제 Apple 로그인 플로우로 identityToken 취득 필요
        // 예) const credential = await AppleAuthentication.signInAsync({...})
        //     const identityToken = credential.identityToken
        // 현재 프로젝트에 Apple 로그인 SDK가 없어 identityToken을 발급받을 수 없으므로,
        // SDK 연동 전까지는 아래 호출이 실행되지 않도록 가드한다.
        const identityToken: string | null = null
        if (!identityToken) {
          throw new Error('APPLE_SDK_NOT_INSTALLED')
        }

        appleLogin(
          { identityToken },
          {
            onSuccess: (data) => {
              setTokens(data.accessToken, data.refreshToken)
              setSocialLoading(false)
              setSocialDialog(null)
            },
            onError: (error) => {
              setSocialError(extractApiErrorMessage(error, '소셜 로그인에 실패했습니다. 잠시 후 다시 시도해주세요'))
              setSocialLoading(false)
            },
          }
        )
      } catch {
        setSocialError('애플 로그인 SDK가 아직 연동되지 않았습니다. expo-apple-authentication 설치가 필요합니다')
        setSocialLoading(false)
      }
      return
    }

    // TODO: 카카오 SDK 연동 전까지는 실제 인증 요청 없이 준비중 안내만 표시한다
    // kakao: 카카오 SDK 인가코드 취득 후 POST /auth/kakao 전송 예정
    setSocialError('카카오 로그인은 아직 준비중입니다')
  }

  const handleSocialCancel = () => {
    if (socialLoading) return
    setSocialDialog(null)
    setSocialError(null)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#F2F2F2]"
    >
      <ScreenHeader onBack={() => navigation.goBack()} />

      <ScrollView
        className="flex-1 px-[26px]"
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title — Figma: 헤더(상단여백54+네비바56=110) 아래 34px 고정 */}
        <Text className="mt-[34px] text-[28px] font-extrabold text-black">로그인</Text>
        <Text className="mt-2 text-[13px] font-medium text-gray2">
          최근에 이용한 항목으로 로그인 해주세요
        </Text>

        {formError && (
          <View className="mt-4 rounded-lg bg-[#fdecea] px-4 py-3">
            <Text className="text-[13px] font-medium text-[#ea4335]">{formError}</Text>
          </View>
        )}

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
                onFocus={() => clearErrors('email')}
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
                label="비밀번호(영소문자+숫자 조합 8자 이상)"
                value={value}
                onChangeText={onChange}
                onFocus={() => clearErrors('password')}
                errorMessage={errors.password?.message}
                secureToggle
                secureTextEntry
              />
            )}
          />
        </View>

        {/* 로그인 버튼 */}
        <View className="mt-[20px]">
          <Button label="로그인" variant="primary" onPress={onSubmit} disabled={isPending} />
        </View>

        {/* 자동로그인 / 비밀번호 찾기 — Figma상 한 줄 중앙 정렬 */}
        <View className="mt-4 flex-row items-center justify-center gap-1">
          <Pressable
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="자동로그인"
            accessibilityState={{ checked: autoLogin }}
            onPress={handleAutoLoginPress}
          >
            <Text className="text-[13px] font-medium text-gray2">자동로그인</Text>
          </Pressable>
          <Text className="text-[13px] font-medium text-gray2">/</Text>
          <Pressable
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="비밀번호 찾기"
          >
            <Text className="text-[13px] font-medium text-gray2">비밀번호 찾기</Text>
          </Pressable>
        </View>

        {/* 구분선 + 소셜 로그인 + 회원가입 안내 — 세 블록을 하나로 묶어 gap으로 간격 통일 */}
        <View className="mt-[60px] gap-5">
          <View className="flex-row items-center gap-3">
            <View className="h-px flex-1 bg-gray1" />
            <Text className="text-[13px] font-medium text-gray2">or 아래 계정으로 로그인</Text>
            <View className="h-px flex-1 bg-gray1" />
          </View>

          <View className="flex-row items-center gap-2">
            <Button
              label="구글로 로그인"
              variant="socialIcon"
              icon={<GoogleIcon size={24} />}
              onPress={() => setSocialDialog('google')}
            />
            <Button
              label="카카오로 로그인 (준비중)"
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

          <View className="flex-row items-center gap-3">
            <View className="h-px flex-1 bg-gray1" />
            <View className="flex-row items-center gap-1">
              <Text className="text-[13px] font-medium text-gray2">계정이 없으신가요?</Text>
              <Pressable
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="회원가입"
                onPress={() => navigation.navigate('SignUp')}
              >
                <Text className="text-[13px] font-semibold text-gray3">회원가입</Text>
              </Pressable>
            </View>
            <View className="h-px flex-1 bg-gray1" />
          </View>
        </View>

        {/* 약관 안내 — Figma: 회원가입 안내 행 하단에서 108px 고정 */}
        <View className="mt-[108px] items-center gap-1">
          <Text className="text-center text-[10px] font-normal tracking-[0.2px] leading-[1.45] text-gray2">
            로그인시 아래 내용에 동의하는 것으로 간주됩니다
          </Text>
          <View className="flex-row items-center gap-[27px]">
            <Pressable
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="개인정보 처리방침"
            >
              <Text className="text-[10px] font-normal tracking-[0.2px] leading-[1.45] text-gray2 underline">
                개인정보 처리방침
              </Text>
            </Pressable>
            <Pressable
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="이용약관"
            >
              <Text className="text-[10px] font-normal tracking-[0.2px] leading-[1.45] text-gray2 underline">
                이용약관
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={socialDialog !== null}
        title={socialDialog ? `${SOCIAL_LABEL[socialDialog]}로 로그인하기` : ''}
        description={socialError ?? '계정연동을 위한 화면으로 이동합니다'}
        onConfirm={handleSocialConfirm}
        onCancel={handleSocialCancel}
        confirmLoading={socialLoading || isGoogleLoginPending || isAppleLoginPending}
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
