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
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
  }
}
