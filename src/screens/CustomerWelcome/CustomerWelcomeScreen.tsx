// src/screens/CustomerWelcome/CustomerWelcomeScreen.tsx

import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useEffect, useRef } from 'react'
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { LinearGradient } from 'expo-linear-gradient'

import { ArrowNextIcon } from '@/assets/icons'
import bgImage from '@/assets/icons/background.png'
import { useSignUp } from '@/hooks/useSignUp'
import { useSwitchMode } from '@/hooks/useSwitchMode'
import { RootStackParamList } from '@/navigation/RootNavigator'
import { useAuthStore } from '@/store/authStore'
import { useSignUpDraftStore } from '@/store/signupDraftStore'
import { mapSignUpError } from '@/utils/signupValidation'

// 이 화면 진입 시점에 모드를 확정한다(customer).
// - draft가 있으면(이메일 가입) 이 시점에 실제 계정을 생성
// - draft가 없으면(소셜 가입 — 계정은 이미 생성돼 있음) 모드만 지정
// 실패 시 SignUp 화면으로 되돌려 에러를 보여준다.
export function CustomerWelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  // insets.top/insets.bottom은 런타임에만 알 수 있는 동적 값이라 style 사용이 불가피한 의도적 예외
  const insets = useSafeAreaInsets()
  const { mutate: signUp } = useSignUp()
  const { mutate: switchMode } = useSwitchMode()
  const setAuthSession = useAuthStore((state) => state.setAuthSession)
  const setModeSelected = useAuthStore((state) => state.setModeSelected)
  const draft = useSignUpDraftStore((state) => state.draft)
  const clearDraft = useSignUpDraftStore((state) => state.clearDraft)
  const setPendingError = useSignUpDraftStore((state) => state.setPendingError)
  const hasRegisteredRef = useRef(false)

  useEffect(() => {
    if (hasRegisteredRef.current) return
    hasRegisteredRef.current = true

    if (draft) {
      signUp(
        { ...draft, mode: 'customer' },
        {
          onSuccess: (data) => {
            setAuthSession(data.accessToken, data.refreshToken, data.user)
            clearDraft()
          },
          onError: (error) => {
            setPendingError(mapSignUpError(error))
            navigation.navigate('SignUp')
          },
        }
      )
      return
    }

    switchMode(
      { mode: 'customer' },
      {
        onSuccess: (data) => {
          setModeSelected(data.currentMode)
        },
        onError: (error) => {
          setPendingError(mapSignUpError(error))
          navigation.navigate('SignUp')
        },
      }
    )
    // 최초 진입 시 1회만 실행 — draft/signUp/switchMode/의존 값은 store·훅에서 안정적으로 제공됨
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePress = () => {
    navigation.navigate('CustomerHome')
  }

  return (
    <Pressable
      className="flex-1"
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="눌러서 홈으로 이동"
      accessibilityHint="홈 화면으로 이동합니다"
    >
      <ImageBackground
        source={bgImage}
        resizeMode="cover"
        className="flex-1 bg-black"
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        <LinearGradient
          colors={['#07091C', 'rgba(7,9,28,0.7)', '#07091C']}
          locations={[0, 0.51, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Figma: 타이틀 top=170(다른 화면과 동일한 안전영역 54 기준 → insets.top+116),
            버튼 하단 여백=117(캔버스 바닥 기준 → insets.bottom+117) */}
        <View className="flex-1 px-[44px]" style={{ paddingTop: insets.top + 116 }}>
          <Text className="text-center font-pretendard-extrabold text-[28px] leading-[36px] text-white">
            &apos;운동명인&apos;과{'\n'}명품 운동을 시작합니다
          </Text>

          {/* 타이틀-버튼 사이 여백 — 버튼은 항상 하단에 고정, 타이틀은 항상 상단에 고정 */}
          <View className="flex-1" />

          <View
            className="flex-row items-center gap-1 self-end"
            style={{ marginBottom: insets.bottom + 117 }}
          >
            <Text className="font-pretendard-semibold text-[12px] text-[#F2F2F2]">
              눌러서 홈으로
            </Text>
            <ArrowNextIcon color="#F2F2F2" />
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  )
}
