import { useInfiniteQuery } from '@tanstack/react-query'

import { apiClient } from '@/api/client'

export type WrittenReviewItem = {
  id: number
  rating: number
  content?: string
  imageUrls: string[]
  createdAt: string
  expertProfileId?: number
  expertName?: string
  expertAvatarUrl?: string | null
}

type ReviewsPage = {
  data: WrittenReviewItem[]
  total: number
}

async function fetchMyWrittenReviews({ pageParam }: { pageParam: number }): Promise<ReviewsPage> {
  const { data } = await apiClient.get<{ data: ReviewsPage }>('/reviews/written-by-me', {
    params: { page: pageParam, limit: 20 },
  })
  return data.data
}

export function useMyWrittenReviews() {
  return useInfiniteQuery({
    queryKey: ['reviews', 'written-by-me'],
    queryFn: fetchMyWrittenReviews,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const fetched = allPages.flatMap((p) => p.data).length
      return fetched < lastPage.total ? allPages.length + 1 : undefined
    },
  })
}
