import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/api/client'

export type DiagnosisSentItem = {
  expertProfileId: number
  expertName: string
  expertIntroduction?: string | null
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
    // 명인이 진단요청을 삭제하면 즉시 반영되도록 진입할 때마다 재조회
    staleTime: 0,
    refetchOnMount: 'always',
  })
}
