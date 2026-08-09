import { useEffect, useMemo, useState } from 'react'

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
import { useGoogleAuth } from '@/hooks/useGoogleAuth'
import { useGoogleLogin } from '@/hooks/useGoogleLogin'
import { RootStackParamList } from '@/navigation/RootNavigator'
import { useAuthStore } from '@/store/authStore'
import { useSignUpDraftStore } from '@/store/signupDraftStore'
import { extractApiErrorMessage, signUpSchema, type SignUpFormValues } from '@/utils/signupValidation'
import { navigateAfterAuth } from '@/utils/socialAuthNavigation'

type SocialProvider = 'google' | 'kakao' | 'apple'

const SOCIAL_LABEL: Record<SocialProvider, string> = {
  google: '구글',
  kakao: '카카오',
  apple: '애플',
}

// leading-[1.45]처럼 배수 기반 line-height는 플랫폼별 폰트 metrics 차이로 렌더링이 미세하게
// 달라질 수 있어 고정 px 값을 사용. 최소 가독성 크기(12px) 확보.
const LEGAL_TEXT_CLASS =
  'text-center text-[12px] font-normal tracking-[0.2px] leading-[17px] text-gray2'

export function SignUpScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [socialDialog, setSocialDialog] = useState<SocialProvider | null>(null)
  const [socialLoading, setSocialLoading] = useState(false)
  const [socialError, setSocialError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const setAuthSession = useAuthStore((state) => state.setAuthSession)
  const setDraft = useSignUpDraftStore((state) => state.setDraft)
  const consumePendingError = useSignUpDraftStore((state) => state.consumePendingError)
  const { mutate: googleLogin, isPending: isGoogleLoginPending } = useGoogleLogin()
  const { promptGoogle } = useGoogleAuth()
  const insets = useSafeAreaInsets()
  // insets는 런타임 계산 값이라 className으로 표현할 수 없어 style로 최소 사용
  // 네비바(ScreenHeader) 높이는 54(고정 mt) + 56 — KeyboardAvoidingView 오프셋 계산에 사용
  const NAV_BAR_HEIGHT = 54 + 56
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
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: useSignUpDraftStore.getState().draft ?? { nickname: '', email: '', password: '' },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  })

  // 계정 생성(POST /auth/register)은 여기서 하지 않는다 — 명인/고객 역할이 확정되는 시점
  // (MasterVerification 선택완료·나중에 / CustomerWelcome 진입)에 mode와 함께 한 번에 생성한다.
  // 이 화면은 입력값을 draft store에 잠시 보관하고 역할선택 화면으로 넘어가기만 한다.
  const onSubmit = handleFormSubmit((values) => {
    setFormError(null)
    setDraft(values)
    navigation.navigate('SignUpRoleSelect')
  })

  // 이후 화면에서 계정 생성이 실패하면 이 화면으로 돌아와 해당 필드(또는 폼 전체)에 에러를 보여준다.
  useEffect(() => {
    const pendingError = consumePendingError()
    if (!pendingError) return
    if (pendingError.field === 'form') {
      setFormError(pendingError.message)
    } else {
      setError(pendingError.field, { message: pendingError.message })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSocialConfirm = async () => {
    setSocialError(null)

    if (socialDialog === 'google') {
      setSocialLoading(true)
      try {
        const result = await promptGoogle()
        if (!result) {
          // 사용자가 브라우저에서 취소한 경우 — 에러로 취급하지 않고 조용히 종료
          setSocialLoading(false)
          return
        }

        googleLogin(result, {
          onSuccess: (data) => {
            setAuthSession(data.accessToken, data.refreshToken, data.user)
            setSocialLoading(false)
            setSocialDialog(null)
            // isNewUser거나 모드 미확정(중간 이탈 후 재시도 포함)이면 역할선택으로,
            // 이미 모드가 확정된 기존 계정이면 바로 해당 홈으로 이동
            navigateAfterAuth(navigation, {
              isNewUser: data.isNewUser,
              hasSelectedMode: data.user.hasSelectedMode,
              currentMode: data.user.currentMode,
            })
          },
          onError: (error) => {
            setSocialError(extractApiErrorMessage(error, '소셜 회원가입에 실패했습니다. 잠시 후 다시 시도해주세요'))
            setSocialLoading(false)
          },
        })
      } catch {
        setSocialError('구글 로그인 설정이 완료되지 않았습니다. 잠시 후 다시 시도해주세요')
        setSocialLoading(false)
      }
      return
    }

    // TODO: 카카오/애플 SDK 연동 전까지는 실제 인증 요청 없이 준비중 안내만 표시한다
    setSocialLoading(true)
    setSocialError(`${SOCIAL_LABEL[socialDialog as SocialProvider]} 회원가입은 아직 준비중입니다`)
    setSocialLoading(false)
  }

  const handleSocialCancel = () => {
    if (socialLoading) return
    setSocialDialog(null)
    setSocialError(null)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={NAV_BAR_HEIGHT}
      className="flex-1 bg-[#F2F2F2]"
    >
      <ScreenHeader onBack={() => navigation.goBack()} />

      <ScrollView
        className="flex-1 px-[26px]"
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title — Figma: 헤더(상단여백54+네비바56=110) 아래 34px 고정 */}
        <Text className="mt-[34px] text-[28px] font-extrabold text-black">회원가입</Text>
        <Text className="mt-2 text-[13px] font-medium text-gray2">
          이메일, 소셜 계정 중 선택해 앱에 회원가입 합니다
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
            name="nickname"
            render={({ field: { value, onChange } }) => (
              <TextField
                label="닉네임(띄어쓰기 없이 8자 이내)"
                value={value}
                onChangeText={onChange}
                onFocus={() => clearErrors('nickname')}
                errorMessage={errors.nickname?.message}
                autoCapitalize="none"
                maxLength={8}
              />
            )}
          />
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

        {/* 회원가입 버튼 — Figma: 마지막 입력 필드 하단에서 36px */}
        <View className="mt-9">
          <Button label="회원가입" variant="primary" onPress={onSubmit} />
        </View>

        {/* 구분선 + 소셜 회원가입 + 로그인 안내 — 세 블록을 하나로 묶어 gap으로 간격 통일 */}
        <View className="mt-[20px] gap-5">
          <View className="flex-row items-center gap-3">
            <View className="h-px flex-1 bg-gray1" />
            <Text className="text-[13px] font-medium text-gray2">or 아래 계정으로 회원가입</Text>
            <View className="h-px flex-1 bg-gray1" />
          </View>

          {/* Button의 socialIcon variant는 h-[50px] + hitSlop={8}로 이미 44pt 이상의
              터치 영역을 보장한다 (components/Button.tsx 참고) */}
          <View className="flex-row items-center gap-2">
            <Button
              label="구글로 회원가입"
              variant="socialIcon"
              icon={<GoogleIcon size={24} />}
              onPress={() => setSocialDialog('google')}
            />
            <Button
              label="카카오로 회원가입"
              variant="socialIcon"
              icon={<KakaoIcon size={24} />}
              onPress={() => setSocialDialog('kakao')}
            />
            <Button
              label="애플로 회원가입"
              variant="socialIcon"
              icon={<AppleIcon size={24} />}
              onPress={() => setSocialDialog('apple')}
            />
          </View>

          <View className="flex-row items-center gap-3">
            <View className="h-px flex-1 bg-gray1" />
            <View className="flex-row items-center gap-1">
              <Text className="text-[13px] font-medium text-gray2">계정이 있으신가요?</Text>
              <Pressable
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="로그인"
                onPress={() => navigation.goBack()}
              >
                <Text className="text-[13px] font-semibold text-gray3">로그인</Text>
              </Pressable>
            </View>
            <View className="h-px flex-1 bg-gray1" />
          </View>
        </View>

        {/* 약관 안내 — Figma: 로그인 안내 행 하단에서 98px 고정 */}
        <View className="mt-[98px] items-center gap-1">
          <Text className={LEGAL_TEXT_CLASS}>회원가입시 아래 내용에 동의하는 것으로 간주됩니다.</Text>
          <View className="flex-row items-center gap-[27px]">
            <Pressable
              hitSlop={8}
              className="py-1"
              accessibilityRole="button"
              accessibilityLabel="개인정보 처리방침"
            >
              <Text className={`${LEGAL_TEXT_CLASS} underline`}>개인정보 처리방침</Text>
            </Pressable>
            <Pressable
              hitSlop={8}
              className="py-1"
              accessibilityRole="button"
              accessibilityLabel="이용약관"
            >
              <Text className={`${LEGAL_TEXT_CLASS} underline`}>이용약관</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={socialDialog !== null}
        title={socialDialog ? `${SOCIAL_LABEL[socialDialog]}로 가입하기` : ''}
        description={socialError ?? '계정연동을 위한 화면으로 이동합니다'}
        onConfirm={handleSocialConfirm}
        onCancel={handleSocialCancel}
        confirmLoading={socialLoading || isGoogleLoginPending}
      />
    </KeyboardAvoidingView>
  )
}
