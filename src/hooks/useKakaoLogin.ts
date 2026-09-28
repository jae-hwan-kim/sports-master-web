import * as Sentry from '@sentry/react-native'

import { useMutation } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import type { components } from '@/types/schema'

type KakaoLoginDto = components['schemas']['KakaoLoginDto']
type OAuthTokenResponseDto = components['schemas']['OAuthTokenResponseDto']

async function kakaoLogin(payload: KakaoLoginDto): Promise<OAuthTokenResponseDto> {
  const { data } = await apiClient.post<{ data: OAuthTokenResponseDto }>('/auth/kakao', payload)
  return data.data
}

export function useKakaoLogin() {
  return useMutation({
    mutationFn: kakaoLogin,
    retry: false,
    onError: (error) => {
      Sentry.captureException(error, { tags: { flow: 'kakao-login' } })
    },
  })
}
