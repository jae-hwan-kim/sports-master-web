import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/api/client'

export type DiagnosisSentItem = {
  expertProfileId: number
  expertName: string
  expertAvatarUrl: string | null
  expertGrade: string
  avgRating: number
  reviewCount: number
  hasWrittenReview: boolean
}

async function fetchReviewableExperts(): Promise<DiagnosisSentItem[]> {
  const { data } = await apiClient.get<{ data: DiagnosisSentItem[] }>('/diagnoses/my-sent')
  return data.data
}

export function useReviewableExperts() {
  return useQuery({
    queryKey: ['diagnoses', 'my-sent'],
    queryFn: fetchReviewableExperts,
    staleTime: 60_000,
  })
}
