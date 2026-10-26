import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { isAxiosError } from 'axios'

import { useEffect, useRef, useState } from 'react'
import { Linking } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import PretendardBold from '@/assets/fonts/Pretendard-Bold.otf'
import PretendardExtraBold from '@/assets/fonts/Pretendard-ExtraBold.otf'
import PretendardMedium from '@/assets/fonts/Pretendard-Medium.otf'
import PretendardRegular from '@/assets/fonts/Pretendard-Regular.otf'
import PretendardSemiBold from '@/assets/fonts/Pretendard-SemiBold.otf'
import type { RootStackParamList } from '@/navigation/RootNavigator'
import { RootNavigator } from '@/navigation/RootNavigator'
import { devLinking } from '@/navigation/devLinking'
import { parseReviewLinkToken, useReviewLinkStore } from '@/store/reviewLinkStore'
import { type RestoredSession, restoreAutoLoginSession } from '@/utils/autoLogin'

import './global.css'

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
  tracesSampleRate: 1.0,
  enabled: !!process.env.EXPO_PUBLIC_SENTRY_DSN,
})

SplashScreen.preventAutoHideAsync()

// 4xx는 재시도해도 결과가 같음 — 기본 3회 재시도(지수 백오프 ~7초) 동안 로딩만 길어지므로 즉시 실패 처리
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (isAxiosError(error) && error.response && error.response.status < 500) return false
        return failureCount < 2
      },
    },
  },
})
const navRef = createNavigationContainerRef<RootStackParamList>()

export default function App() {
  const [fontsLoaded] = useFonts({
    'Pretendard-Regular': PretendardRegular,
    'Pretendard-Medium': PretendardMedium,
    'Pretendard-SemiBold': PretendardSemiBold,
    'Pretendard-Bold': PretendardBold,
    'Pretendard-ExtraBold': PretendardExtraBold,
  })
  const [authReady, setAuthReady] = useState(false)
  const restoredSession = useRef<RestoredSession | null>(null)

  // 리뷰 링크로 열림(콜드 스타트 + 실행 중) — 토큰만 보관, 이동은 홈 진입 시 ModeHomeNavigator가 처리
  useEffect(() => {
    const capture = (url: string | null) => {
      const token = parseReviewLinkToken(url)
      if (token) useReviewLinkStore.getState().setPendingToken(token)
    }
    Linking.getInitialURL().then(capture)
    const sub = Linking.addEventListener('url', ({ url }) => capture(url))
    return () => sub.remove()
  }, [])

  useEffect(() => {
    restoreAutoLoginSession().then((session) => {
      restoredSession.current = session
      setAuthReady(true)
    })
  }, [])

  useEffect(() => {
    if (fontsLoaded && authReady) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, authReady])

  if (!fontsLoaded || !authReady) return null

  const handleNavReady = () => {
    const session = restoredSession.current
    if (!session) return
    // 자동로그인 — 홈에서 뒤로가기 시 온보딩으로 돌아가지 않도록 스택을 홈 하나로 초기화
    if (!session.hasSelectedMode) {
      navRef.reset({ index: 1, routes: [{ name: 'Onboarding' }, { name: 'SignUpRoleSelect' }] })
      return
    }
    navRef.reset({
      index: 0,
      routes: [{ name: session.currentMode === 'expert' ? 'MasterHome' : 'CustomerHome' }],
    })
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer ref={navRef} linking={devLinking} onReady={handleNavReady}>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}
