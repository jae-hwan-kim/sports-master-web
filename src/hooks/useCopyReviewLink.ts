import * as Sentry from '@sentry/react-native'
import { isAxiosError } from 'axios'

import * as Clipboard from 'expo-clipboard'

import { useMutation } from '@tanstack/react-query'

import { requestReviewLink } from '@/hooks/useRequestReviewLink'

type Handlers = {
  onCopied: () => void
  // 명인 프로필이 없어 링크를 만들 수 없음 (BE 404)
  onNoProfile: () => void
  onError: () => void
}

// 명인홈 '링크 보내기' — chatRoomId 없이 명인 단위 리뷰 링크를 만들어 클립보드에 복사
export function useCopyReviewLink({ onCopied, onNoProfile, onError }: Handlers) {
  return useMutation({
    mutationFn: () => requestReviewLink({}),
    // 메신저에서 클릭되는 https 링크 우선 (구버전 서버는 shareUrl 없음 → 딥링크)
    onSuccess: async ({ shareUrl, deepLink }) => {
      await Clipboard.setStringAsync(shareUrl ?? deepLink)
      onCopied()
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 404) {
        onNoProfile()
        return
      }
      Sentry.captureException(error, { tags: { flow: 'copyReviewLink' } })
      onError()
    },
  })
}
