import * as Sentry from '@sentry/react-native'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/api/client'
import type { components } from '@/types/schema'

type FavoriteStatusDto = components['schemas']['FavoriteStatusDto']

async function fetchFavoriteStatus(expertProfileId: number): Promise<FavoriteStatusDto> {
  const { data } = await apiClient.get<{ data: FavoriteStatusDto }>(
    `/favorite-experts/${expertProfileId}/status`,
  )
  return data.data
}

async function toggleFavorite(expertProfileId: number): Promise<FavoriteStatusDto> {
  const { data } = await apiClient.post<{ data: FavoriteStatusDto }>(
    `/favorite-experts/${expertProfileId}`,
  )
  return data.data
}

export function useFavoriteExpert(expertProfileId: number) {
  const queryClient = useQueryClient()
  const queryKey = ['favoriteExpert', expertProfileId]

  const statusQuery = useQuery({
    queryKey,
    queryFn: () => fetchFavoriteStatus(expertProfileId),
    enabled: expertProfileId > 0,
  })

  const toggleMutation = useMutation({
    mutationFn: () => toggleFavorite(expertProfileId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<FavoriteStatusDto>(queryKey)
      queryClient.setQueryData(queryKey, (old: FavoriteStatusDto | undefined) =>
        old ? { ...old, isFavorited: !old.isFavorited } : old
      )
      return { previous }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data)
      // 저장한 명인 목록·탐색 화면 찜 표시 갱신
      queryClient.invalidateQueries({ queryKey: ['favorite-experts', 'me'] })
    },
    onError: (error, _, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous)
      }
      Sentry.captureException(error, { tags: { flow: 'toggleFavoriteExpert' } })
    },
  })

  return {
    isFavorited: statusQuery.data?.isFavorited ?? false,
    isLoading: statusQuery.isLoading,
    toggle: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
  }
}
