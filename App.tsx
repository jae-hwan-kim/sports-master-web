import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'

import { useEffect, useRef, useState } from 'react'
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
import { type RestoredSession, restoreAutoLoginSession } from '@/utils/autoLogin'

import './global.css'

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
  tracesSampleRate: 1.0,
  enabled: !!process.env.EXPO_PUBLIC_SENTRY_DSN,
})

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient()
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
