import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as Sentry from '@sentry/react-native'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert } from 'react-native'

import { apiClient } from '@/api/client'
import { RootStackParamList } from '@/navigation/RootNavigator'
import { useAuthStore } from '@/store/authStore'
import type { components } from '@/types/schema'
import { extractApiErrorMessage } from '@/utils/signupValidation'

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
      navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] })
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { flow: 'withdraw' } })
      Alert.alert(
        '탈퇴 실패',
        extractApiErrorMessage(error, '탈퇴 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요')
      )
    },
  })
}
