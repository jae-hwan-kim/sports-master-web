import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import type { components } from '@/types/schema'

export type FeaturedExpert = components['schemas']['FeaturedExpertDto']

async function fetchFeaturedExperts(): Promise<FeaturedExpert[]> {
  const { data } = await apiClient.get<{ data: FeaturedExpert[] }>('/home/featured-experts')
  return data.data
}

// 고객홈 '이달의 소개 명인' — 광고 기능 전까지 DB 명인 노출
export function useFeaturedExperts() {
  return useQuery({
    queryKey: ['home', 'featured-experts'],
    queryFn: fetchFeaturedExperts,
    staleTime: 1000 * 60 * 5,
  })
}
