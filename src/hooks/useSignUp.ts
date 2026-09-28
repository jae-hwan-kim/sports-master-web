import * as Sentry from '@sentry/react-native'

import { useMutation } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import type { components } from '@/types/schema'

type RegisterDto = components['schemas']['RegisterDto']
type AuthTokenResponseDto = components['schemas']['AuthTokenResponseDto']

async function register(payload: RegisterDto): Promise<AuthTokenResponseDto> {
  const { data } = await apiClient.post<{ data?: AuthTokenResponseDto }>('/auth/register', payload)
  if (!data.data) {
    throw new Error('회원가입 응답이 올바르지 않습니다')
  }
  return data.data
}

export function useSignUp() {
  return useMutation({
    mutationFn: register,
    onError: (error) => {
      Sentry.captureException(error, { tags: { flow: 'signup' } })
    },
  })
}
