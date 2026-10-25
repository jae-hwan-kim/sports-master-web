import { useInfiniteQuery } from '@tanstack/react-query'

import { apiClient } from '@/api/client'

export type ReviewItem = {
  id: number
  rating: number
  content: string
  imageUrls: string[]
  createdAt: string
  customerNickname: string | null
  customerProfileImageUrl: string | null
}

type ReviewsPage = {
  data: ReviewItem[]
  total: number
}

type UseMyReviewsParams = {
  sort?: string
  // 지정 시 해당 명인의 리뷰(고객의 명인 상세 '리뷰 보기'), 생략 시 내(명인) 리뷰
  expertProfileId?: number
}

const reviewsPath = (expertProfileId?: number) =>
  expertProfileId === undefined ? '/reviews/me' : `/reviews/experts/${expertProfileId}`

async function fetchMyReviews({
  pageParam,
  sort,
  expertProfileId,
}: {
  pageParam: number
  sort?: string
  expertProfileId?: number
}): Promise<ReviewsPage> {
  const { data } = await apiClient.get<{ data: ReviewsPage }>(reviewsPath(expertProfileId), {
    params: { sort, page: pageParam, limit: 20 },
  })
  return data.data
}

export function useMyReviews({ sort, expertProfileId }: UseMyReviewsParams = {}) {
  return useInfiniteQuery({
    queryKey: ['reviews', expertProfileId ?? 'me', sort],
    queryFn: ({ pageParam }) =>
      fetchMyReviews({ pageParam: pageParam as number, sort, expertProfileId }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const fetched = allPages.flatMap((p) => p.data).length
      return fetched < lastPage.total ? allPages.length + 1 : undefined
    },
  })
}
