import { useMutation } from '@tanstack/react-query'
import * as Sentry from '@sentry/react-native'

import { apiClient } from '@/api/client'
import type { components } from '@/types/schema'

type AppleLoginDto = components['schemas']['AppleLoginDto']
type OAuthTokenResponseDto = components['schemas']['OAuthTokenResponseDto']

async function appleLogin(payload: AppleLoginDto): Promise<OAuthTokenResponseDto> {
  const { data } = await apiClient.post<{ data: OAuthTokenResponseDto }>('/auth/apple', payload)
  return data.data
}

export function useAppleLogin() {
  return useMutation({
    mutationFn: appleLogin,
    onError: (error) => {
      Sentry.captureException(error, { tags: { flow: 'apple-login' } })
    },
  })
}
