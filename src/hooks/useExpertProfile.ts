import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import type { components } from '@/types/schema'

type ExpertProfileResponseDto = components['schemas']['ExpertProfileResponseDto']

async function fetchExpertProfile(id: number): Promise<ExpertProfileResponseDto> {
  const { data } = await apiClient.get<{ data: ExpertProfileResponseDto }>(`/expert-profiles/${id}`)
  return data.data
}

export function useExpertProfile(id: number) {
  return useQuery({
    queryKey: ['expertProfile', id],
    queryFn: () => fetchExpertProfile(id),
    enabled: id > 0,
  })
}
