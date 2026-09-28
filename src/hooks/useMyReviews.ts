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
  photoOnly?: boolean
}

async function fetchMyReviews({
  pageParam,
  sort,
  photoOnly,
}: {
  pageParam: number
  sort?: string
  photoOnly?: boolean
}): Promise<ReviewsPage> {
  const { data } = await apiClient.get<{ data: ReviewsPage }>('/reviews/me', {
    params: { sort, photoOnly, page: pageParam, limit: 20 },
  })
  return data.data
}

export function useMyReviews({ sort, photoOnly }: UseMyReviewsParams = {}) {
  return useInfiniteQuery({
    queryKey: ['reviews', 'me', sort, photoOnly],
    queryFn: ({ pageParam }) => fetchMyReviews({ pageParam: pageParam as number, sort, photoOnly }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const fetched = allPages.flatMap((p) => p.data).length
      return fetched < lastPage.total ? allPages.length + 1 : undefined
    },
  })
}
