import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import type { components } from '@/types/schema'

type ExpertProfileResponseDto = components['schemas']['ExpertProfileResponseDto']

async function fetchMyExpertProfile(): Promise<ExpertProfileResponseDto> {
  const { data } = await apiClient.get<{ data: ExpertProfileResponseDto }>('/expert-profiles/me')
  return data.data
}

export function useMyExpertProfile() {
  return useQuery({
    queryKey: ['expertProfile', 'me'],
    queryFn: fetchMyExpertProfile,
    // 고객 모드 등 명인 프로필이 없으면 404 — 재시도하지 않고 바로 '없음'으로 처리
    retry: (count, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      return status !== 404 && count < 2
    },
  })
}
