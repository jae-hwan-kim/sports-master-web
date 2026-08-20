import * as Sentry from '@sentry/react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import { RootStackParamList } from '@/navigation/RootNavigator'
import { useAuthStore } from '@/store/authStore'
import type { components } from '@/types/schema'

type WithdrawDto = components['schemas']['WithdrawDto']

async function withdraw(payload: WithdrawDto): Promise<void> {
  await apiClient.delete('/auth/withdraw', { data: payload })
}

export function useWithdraw() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const clear = useAuthStore((s) => s.clear)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: withdraw,
    onSuccess: () => {
      clear()
      queryClient.clear()
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { flow: 'withdraw' } })
    },
  })
}
