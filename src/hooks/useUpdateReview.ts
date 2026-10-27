import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/api/client'

type UpdateReviewPayload = {
  id: number
  rating?: number
  comment?: string
}

async function updateReview({ id, ...payload }: UpdateReviewPayload) {
  const { data } = await apiClient.patch<{ data: unknown }>(`/reviews/${id}`, payload)
  return data.data
}

export function useUpdateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateReview,
    onSuccess: () => {
      // written-by-me 포함 해당 명인 리뷰 목록·요약 전체
      qc.invalidateQueries({ queryKey: ['reviews'] })
      qc.invalidateQueries({ queryKey: ['experts'] })
    },
  })
}

// 고객 본인 리뷰 삭제 (복구 불가)
export function useDeleteReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/reviews/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
      qc.invalidateQueries({ queryKey: ['experts'] })
      // 리뷰작성 목록의 작성 완료 여부
      qc.invalidateQueries({ queryKey: ['diagnoses', 'my-sent'] })
    },
  })
}
