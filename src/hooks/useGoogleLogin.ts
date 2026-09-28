import * as Sentry from '@sentry/react-native'

import { useMutation } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import type { components } from '@/types/schema'

type GoogleLoginDto = components['schemas']['GoogleLoginDto']
type OAuthTokenResponseDto = components['schemas']['OAuthTokenResponseDto']

async function googleLogin(payload: GoogleLoginDto): Promise<OAuthTokenResponseDto> {
  const { data } = await apiClient.post<{ data: OAuthTokenResponseDto }>('/auth/google', payload)
  return data.data
}

export function useGoogleLogin() {
  return useMutation({
    mutationFn: googleLogin,
    retry: false,
    onError: (error) => {
      Sentry.captureException(error, { tags: { flow: 'google-login' } })
    },
  })
}
