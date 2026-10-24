import * as Sentry from '@sentry/react-native'

import { Alert, Share } from 'react-native'

import { useMutation } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import type { components } from '@/types/schema'

type CreateReviewTokenDto = components['schemas']['CreateReviewTokenDto']
type ReviewTokenResponseDto = components['schemas']['ReviewTokenResponseDto']

export async function requestReviewLink(
  payload: CreateReviewTokenDto
): Promise<ReviewTokenResponseDto> {
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
    onError: (error) => {
      Sentry.captureException(error, { tags: { flow: 'requestReviewLink' } })
      Alert.alert('오류', '리뷰 링크 생성에 실패했습니다. 잠시 후 다시 시도해주세요.')
    },
  })
}
