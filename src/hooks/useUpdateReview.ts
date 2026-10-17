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
      qc.invalidateQueries({ queryKey: ['reviews', 'written-by-me'] })
    },
  })
}
