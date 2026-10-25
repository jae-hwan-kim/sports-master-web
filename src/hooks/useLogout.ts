import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useQueryClient } from '@tanstack/react-query'

import { RootStackParamList } from '@/navigation/RootNavigator'
import { useAuthStore } from '@/store/authStore'

export function useLogout() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const clear = useAuthStore((s) => s.clear)
  const queryClient = useQueryClient()

  return () => {
    clear()
    queryClient.clear()
    // 로그인 화면의 뒤로가기가 온보딩으로 가도록 온보딩을 아래에 둠 (없으면 뒤로가기 무반응/앱 종료)
    navigation.reset({ index: 1, routes: [{ name: 'Onboarding' }, { name: 'Login' }] })
  }
}
