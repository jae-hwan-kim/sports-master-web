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
}

async function fetchMyReviews({
  pageParam,
  sort,
}: {
  pageParam: number
  sort?: string
}): Promise<ReviewsPage> {
  const { data } = await apiClient.get<{ data: ReviewsPage }>('/reviews/me', {
    params: { sort, page: pageParam, limit: 20 },
  })
  return data.data
}

export function useMyReviews({ sort }: UseMyReviewsParams = {}) {
  return useInfiniteQuery({
    queryKey: ['reviews', 'me', sort],
    queryFn: ({ pageParam }) => fetchMyReviews({ pageParam: pageParam as number, sort }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const fetched = allPages.flatMap((p) => p.data).length
      return fetched < lastPage.total ? allPages.length + 1 : undefined
    },
  })
}
