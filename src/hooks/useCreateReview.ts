import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/api/client'

type CreateReviewPayload = {
  expertProfileId: number
  rating: number
  comment?: string
  // 명인이 보낸 리뷰 링크로 작성 시 — 진단요청 이력 없이 작성 허용
  reviewToken?: string
}

async function createReview(payload: CreateReviewPayload): Promise<{ id: number }> {
  const { data } = await apiClient.post<{ data: { id: number } }>('/reviews', payload)
  return data.data
}

export function useCreateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', 'written-by-me'] })
      qc.invalidateQueries({ queryKey: ['diagnoses', 'my-sent'] })
      // 해당 명인 리뷰 목록·요약, 탐색 목록의 평점/리뷰수
      qc.invalidateQueries({ queryKey: ['reviews'] })
      qc.invalidateQueries({ queryKey: ['experts'] })
    },
    onError: () => {
      // 진단요청이 삭제된 명인 등 — 작성 가능 목록 갱신 (오류 안내는 화면 다이얼로그)
      qc.invalidateQueries({ queryKey: ['diagnoses', 'my-sent'] })
    },
  })
}
