import { Alert } from 'react-native'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/api/client'

type CreateReviewPayload = {
  expertProfileId: number
  rating: number
  comment?: string
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
    },
    onError: () => {
      Alert.alert('오류', '리뷰 등록에 실패했습니다. 다시 시도해 주세요.')
    },
  })
}
