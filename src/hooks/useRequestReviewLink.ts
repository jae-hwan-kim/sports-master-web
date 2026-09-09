import { Share } from 'react-native'

import { useMutation } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import type { components } from '@/types/schema'

type CreateReviewTokenDto = components['schemas']['CreateReviewTokenDto']
type ReviewTokenResponseDto = components['schemas']['ReviewTokenResponseDto']

async function requestReviewLink(payload: CreateReviewTokenDto): Promise<ReviewTokenResponseDto> {
  const { data } = await apiClient.post<{ data: ReviewTokenResponseDto }>(
    '/home/review-request',
    payload
  )
  return data.data
}

export function useRequestReviewLink() {
  return useMutation({
    mutationFn: requestReviewLink,
    onSuccess: async ({ deepLink }) => {
      await Share.share({ url: deepLink, message: deepLink })
    },
  })
}
