import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/api/client'

async function deleteReviewRequest(id: number): Promise<void> {
  await apiClient.post(`/reviews/${id}/delete-request`)
}

export function useDeleteReviewRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteReviewRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'me'] })
    },
  })
}
