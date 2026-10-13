import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/api/client'

export type RecommendedExpert = {
  id: number
  name: string
  region: string
  representativeService: string
  expertGrade: string | null
  averageRating: number
  totalReviewCount: number
  avatarUrl: string | null
  keywordTags: string[] | null
}

export type RecommendedMastersResponse = {
  aiSummary: string
  recommendedExperts: RecommendedExpert[]
}

async function fetchRecommendedMasters(): Promise<RecommendedMastersResponse> {
  const { data } = await apiClient.get<{ data: RecommendedMastersResponse }>('/recommendations/masters')
  return data.data
}

export function useRecommendedMasters() {
  return useQuery({
    queryKey: ['recommendations', 'masters'],
    queryFn: fetchRecommendedMasters,
    staleTime: 1000 * 60 * 5,
  })
}
