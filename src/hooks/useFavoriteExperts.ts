import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/api/client'

export type FavoriteExpertItem = {
  id: number
  name: string
  introduction: string | null
  grade: string | null
  reviewCount: number
  avgRating: number
  avatarUrl: string | null
}

async function fetchFavoriteExperts(): Promise<FavoriteExpertItem[]> {
  const { data } = await apiClient.get<{ data: FavoriteExpertItem[] }>('/favorite-experts/me')
  return data.data
}

export function useFavoriteExperts() {
  return useQuery({
    queryKey: ['favorite-experts', 'me'],
    queryFn: fetchFavoriteExperts,
    staleTime: 1000 * 60 * 5,
  })
}

// 저장 목록에서 제외 — 목록에서 즉시 빼고 실패 시 복구
export function useRemoveFavoriteExpert() {
  const queryClient = useQueryClient()
  const queryKey = ['favorite-experts', 'me']

  return useMutation({
    mutationFn: (expertProfileId: number) =>
      apiClient.delete(`/favorite-experts/${expertProfileId}`),
    onMutate: async (expertProfileId) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<FavoriteExpertItem[]>(queryKey)
      queryClient.setQueryData<FavoriteExpertItem[]>(queryKey, (old) =>
        old?.filter((item) => item.id !== expertProfileId)
      )
      return { previous }
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
    },
    onSettled: (_data, _error, expertProfileId) => {
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: ['favoriteExpert', expertProfileId] })
    },
  })
}
