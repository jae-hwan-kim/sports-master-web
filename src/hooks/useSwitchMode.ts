import { useMutation } from '@tanstack/react-query'
import * as Sentry from '@sentry/react-native'

import { apiClient } from '@/api/client'
import type { components } from '@/types/schema'

type UpdateModeDto = components['schemas']['UpdateModeDto']
type UpdateModeResponseDto = components['schemas']['UpdateModeResponseDto']

async function switchMode(payload: UpdateModeDto): Promise<UpdateModeResponseDto> {
  const { data } = await apiClient.patch<{ data: UpdateModeResponseDto }>('/home/mode', payload)
  return data.data
}

export function useSwitchMode() {
  return useMutation({
    mutationFn: switchMode,
    onError: (error) => {
      Sentry.captureException(error, { tags: { flow: 'switch-mode' } })
    },
  })
}
