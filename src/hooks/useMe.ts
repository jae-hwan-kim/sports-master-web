import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import type { components } from '@/types/schema'

type UserResponseDto = components['schemas']['UserResponseDto']

async function fetchMe(): Promise<UserResponseDto> {
  const { data } = await apiClient.get<{ data: UserResponseDto }>('/users/me')
  return data.data
}

// 내 계정 정보 — name 필드가 User.nickname (고객/명인 모드 공통)
export function useMe() {
  return useQuery({ queryKey: ['me'], queryFn: fetchMe, staleTime: 1000 * 60 * 5 })
}
