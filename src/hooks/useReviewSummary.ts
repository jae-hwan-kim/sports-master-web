import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/api/client'

export type ReviewSummary = {
  totalCount: number
  averageRating: number
  ratingDistribution: Record<string, number>
  photoReviewCount: number
}

async function fetchReviewSummary(): Promise<ReviewSummary> {
  const { data } = await apiClient.get<{ data: ReviewSummary }>('/reviews/me/summary')
  return data.data
}

export function useReviewSummary() {
  return useQuery({
    queryKey: ['reviews', 'me', 'summary'],
    queryFn: fetchReviewSummary,
  })
}
