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
