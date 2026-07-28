import { useEffect } from 'react'

import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { RootNavigator } from '@/navigation/RootNavigator'
import PretendardRegular from '@/assets/fonts/Pretendard-Regular.otf'
import PretendardMedium from '@/assets/fonts/Pretendard-Medium.otf'
import PretendardExtraBold from '@/assets/fonts/Pretendard-ExtraBold.otf'
import './global.css'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient()

export default function App() {
  const [fontsLoaded] = useFonts({
    'Pretendard-Regular': PretendardRegular,
    'Pretendard-Medium': PretendardMedium,
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
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}
