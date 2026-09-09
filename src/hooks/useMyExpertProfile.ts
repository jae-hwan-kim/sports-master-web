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
  })
}
