import * as Sentry from '@sentry/react-native'

import { Alert } from 'react-native'

import * as Clipboard from 'expo-clipboard'

import { useMutation } from '@tanstack/react-query'

import { requestReviewLink } from '@/hooks/useRequestReviewLink'

// 명인홈 '링크 보내기' — chatRoomId 없이 명인 단위 리뷰 링크를 만들어 클립보드에 복사
export function useCopyReviewLink(onCopied: () => void) {
  return useMutation({
    mutationFn: () => requestReviewLink({}),
    onSuccess: async ({ deepLink }) => {
      await Clipboard.setStringAsync(deepLink)
      onCopied()
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { flow: 'copyReviewLink' } })
      Alert.alert('오류', '리뷰 링크 생성에 실패했습니다. 잠시 후 다시 시도해주세요.')
    },
  })
}
