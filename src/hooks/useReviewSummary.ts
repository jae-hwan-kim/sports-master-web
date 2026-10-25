import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/api/client'

export type ReviewSummary = {
  totalCount: number
  averageRating: number
  ratingDistribution: Record<string, number>
  photoReviewCount: number
}

async function fetchReviewSummary(expertProfileId?: number): Promise<ReviewSummary> {
  const path =
    expertProfileId === undefined
      ? '/reviews/me/summary'
      : `/reviews/experts/${expertProfileId}/summary`
  const { data } = await apiClient.get<{ data: ReviewSummary }>(path)
  return data.data
}

// expertProfileId 지정 시 해당 명인의 요약, 생략 시 내(명인) 요약
export function useReviewSummary(expertProfileId?: number) {
  return useQuery({
    queryKey: ['reviews', expertProfileId ?? 'me', 'summary'],
    queryFn: () => fetchReviewSummary(expertProfileId),
  })
}
