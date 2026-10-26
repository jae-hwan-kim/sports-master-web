import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import type { components } from '@/types/schema'

export type ReviewLinkInfo = components['schemas']['ReviewLinkInfoDto']

async function fetchReviewLinkInfo(token: string): Promise<ReviewLinkInfo> {
  const { data } = await apiClient.get<{ data: ReviewLinkInfo }>('/reviews/link', {
    params: { token },
  })
  return data.data
}

// 명인이 보낸 리뷰 링크 토큰 → 대상 명인 (만료·위조 토큰은 400)
export function useReviewLinkInfo(token: string | undefined) {
  return useQuery({
    queryKey: ['reviews', 'link', token],
    queryFn: () => fetchReviewLinkInfo(token as string),
    enabled: !!token,
  })
}
