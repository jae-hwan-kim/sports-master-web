import { NavigationContainer } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'

import { useEffect } from 'react'
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
import { RootNavigator } from '@/navigation/RootNavigator'
import { devLinking } from '@/navigation/devLinking'

import './global.css'

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
  tracesSampleRate: 1.0,
  enabled: !!process.env.EXPO_PUBLIC_SENTRY_DSN,
})

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient()

export default function App() {
  const [fontsLoaded] = useFonts({
    'Pretendard-Regular': PretendardRegular,
    'Pretendard-Medium': PretendardMedium,
    'Pretendard-SemiBold': PretendardSemiBold,
    'Pretendard-Bold': PretendardBold,
    'Pretendard-ExtraBold': PretendardExtraBold,
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer linking={devLinking}>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}
