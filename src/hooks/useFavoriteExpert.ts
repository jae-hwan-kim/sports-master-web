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
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data)
    },
  })

  return {
    isFavorited: statusQuery.data?.isFavorited ?? false,
    isLoading: statusQuery.isLoading,
    toggle: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
  }
}
