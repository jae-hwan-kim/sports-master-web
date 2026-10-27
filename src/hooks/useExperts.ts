import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { apiClient } from '@/api/client'

// TODO: BE 배포 후 generate-types 실행 → components['schemas']['ExpertListItemDto']로 교체
export type ExpertListItem = {
  id: number
  name: string
  region: string
  representativeService: string
  introduction: string | null
  keywordTags: string[] | null
  imageUrl: string | null
  averageRating: number
  totalReviewCount: number
}

export type ExpertListFilter = {
  q?: string
  region?: string
  minRating?: number
}

async function fetchExperts(filter: ExpertListFilter): Promise<ExpertListItem[]> {
  const { data } = await apiClient.get<{ data: ExpertListItem[] }>('/expert-profiles', {
    params: filter,
  })
  return data.data
}

// 고객 명인탐색 — 필터가 없으면 전체 명인
export function useExperts(filter: ExpertListFilter) {
  return useQuery({
    queryKey: ['experts', filter],
    queryFn: () => fetchExperts(filter),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  })
}
