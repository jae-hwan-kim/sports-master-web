import { useMutation } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import type { components } from '@/types/schema'

type LoginDto = components['schemas']['LoginDto']
type AuthTokenResponseDto = components['schemas']['AuthTokenResponseDto']

async function login(payload: LoginDto): Promise<AuthTokenResponseDto> {
  const { data } = await apiClient.post<{ data?: AuthTokenResponseDto }>('/auth/login', payload)
  if (!data.data) {
    throw new Error('로그인 응답이 올바르지 않습니다')
  }
  return data.data
}

export function useLogin() {
  return useMutation({
    mutationFn: login,
  })
}
