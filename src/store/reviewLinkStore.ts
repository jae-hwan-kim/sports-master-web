import { create } from 'zustand'

// 명인이 보낸 리뷰 링크(sportsmaster://review?token=...)로 앱이 열렸을 때의 토큰.
// 로그인 전이면 보관만 하고, 홈(ModeHomeNavigator)이 마운트되면 리뷰 작성 화면으로 넘긴 뒤 비운다.
type ReviewLinkState = {
  pendingToken: string | null
  setPendingToken: (token: string) => void
  clearPendingToken: () => void
}

export const useReviewLinkStore = create<ReviewLinkState>((set) => ({
  pendingToken: null,
  setPendingToken: (token) => set({ pendingToken: token }),
  clearPendingToken: () => set({ pendingToken: null }),
}))

// sportsmaster://review?token=xxx → xxx (다른 딥링크는 null)
export function parseReviewLinkToken(url: string | null): string | null {
  if (!url) return null
  const match = url.match(/^sportsmaster:\/\/review\?(?:.*&)?token=([^&#]+)/)
  return match ? decodeURIComponent(match[1]) : null
}
